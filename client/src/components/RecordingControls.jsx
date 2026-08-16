// components/RecordingControls.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Download,
  Video,
  Square,
  Pause,
  Play,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Clock,
  FileVideo,
} from 'lucide-react';
import { LocalStorageService, localStorageService } from '@/services/localStorage.service';
import { streamRecorder } from '@/services/streamRecorder.service';



export const RecordingControls = ({ videoRef, cameraName }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRecordings, setShowRecordings] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    total: 0,
  });
  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);

  // Load recordings on mount
  useEffect(() => {
    loadRecordings();
    updateStorageInfo();

    // Listen for recording status updates
    const interval = setInterval(() => {
      if (isRecording) {
        const status = streamRecorder.getStatus();
        setDuration(status.duration);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const loadRecordings = () => {
    const recs = LocalStorageService.getRecordings();
    setRecordings(recs);
  };

  const updateStorageInfo = async () => {
    const used = localStorageService.getStorageUsed();
    const available = await localStorageService.getAvailableSpace();
    setStorageInfo({
      used,
      available,
      total: used + available,
    });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartRecording = useCallback(async () => {
    if (!videoRef.current) {
      showNotification('Video not found', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await streamRecorder.startRecording(videoRef.current);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      showNotification('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      showNotification(error.message || 'Failed to start recording', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [videoRef]);

  const handleStopRecording = useCallback(async () => {
    setIsProcessing(true);
    try {
      const blob = await streamRecorder.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);

      // Save to local storage
      await localStorageService.saveRecording(blob, {
        cameraName: cameraName || 'Camera',
        duration: streamRecorder.recordingDuration,
        timestamp: Date.now(),
      });

      loadRecordings();
      updateStorageInfo();
      showNotification('Recording saved successfully');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      showNotification(error.message || 'Failed to stop recording', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [cameraName]);

  const handlePauseRecording = useCallback(() => {
    const paused = streamRecorder.pauseRecording();
    if (paused) {
      setIsPaused(true);
      showNotification('Recording paused');
    }
  }, []);

  const handleResumeRecording = useCallback(() => {
    const resumed = streamRecorder.resumeRecording();
    if (resumed) {
      setIsPaused(false);
      showNotification('Recording resumed');
    }
  }, []);

  const handleDownloadRecording = useCallback((recording) => {
    const success = localStorageService.downloadRecording(
      recording,
      `${recording.cameraName || 'camera'}_${recording.timestamp}.webm`
    );
    if (success) {
      showNotification('Download started');
    } else {
      showNotification('Failed to download recording', 'error');
    }
  }, []);

  const handleDeleteRecording = useCallback((id) => {
    const success = localStorageService.deleteRecording(id);
    if (success) {
      loadRecordings();
      updateStorageInfo();
      showNotification('Recording deleted');
    } else {
      showNotification('Failed to delete recording', 'error');
    }
  }, []);

  const handleClearAllRecordings = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all recordings?')) {
      localStorageService.clearAllRecordings();
      loadRecordings();
      updateStorageInfo();
      showNotification('All recordings cleared');
    }
  }, []);

  const formatDuration = (seconds) => {
    return localStorageService.formatDuration(seconds);
  };

  const formatBytes = (bytes) => {
    return localStorageService.formatBytes(bytes);
  };

  return (
    <div className="relative">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm p-2 rounded-lg border border-white/10">
        {/* Duration */}
        {isRecording && (
          <div className="flex items-center gap-2 px-2 text-white">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></span>
              <span className="text-xs font-mono">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        )}

        {/* Recording Buttons */}
        <TooltipProvider>
          {!isRecording ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-red-500/20 hover:text-red-500"
                  onClick={handleStartRecording}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start Recording</TooltipContent>
            </Tooltip>
          ) : (
            <>
              {isPaused ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-green-500/20 hover:text-green-500"
                      onClick={handleResumeRecording}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resume Recording</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-yellow-500/20 hover:text-yellow-500"
                      onClick={handlePauseRecording}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Pause Recording</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-red-500/20 hover:text-red-500"
                    onClick={handleStopRecording}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stop Recording</TooltipContent>
              </Tooltip>
            </>
          )}

          <div className="w-px h-6 bg-white/20"></div>

          {/* Storage / Recordings Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-500/20 hover:text-blue-400"
                onClick={() => setShowRecordings(true)}
              >
                <HardDrive className="w-4 h-4" />
                {recordings.length > 0 && (
                  <Badge className="ml-1 bg-blue-500 text-white text-[8px] px-1 py-0">
                    {recordings.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>View Recordings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Recordings Dialog */}
      <Dialog open={showRecordings} onOpenChange={setShowRecordings}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Saved Recordings</span>
              <div className="flex items-center gap-4 text-sm font-normal">
                <span className="text-slate-500">
                  {formatBytes(storageInfo.used)} used
                </span>
                {recordings.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleClearAllRecordings}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {recordings.length === 0 ? (
              <div className="text-center py-12">
                <FileVideo className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No recordings saved yet</p>
                <p className="text-slate-400 text-sm">
                  Start recording to save videos
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recordings.map((recording) => (
                  <Card key={recording.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileVideo className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium truncate">
                              {recording.cameraName || 'Camera'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(recording.duration || 0)}
                            </span>
                            <span>{formatBytes(recording.size || 0)}</span>
                            <span>
                              {new Date(recording.timestamp).toLocaleDateString()}
                            </span>
                            <span>
                              {new Date(recording.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => handleDownloadRecording(recording)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteRecording(recording.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full text-sm text-slate-500">
              <span>
                {recordings.length} recordings • {formatBytes(storageInfo.used)} used
              </span>
              <Button variant="outline" onClick={() => setShowRecordings(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};