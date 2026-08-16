// frontend/src/components/Recording/RecordingList.jsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Download, Trash2, Eye, X, FileVideo, Clock, HardDrive } from 'lucide-react';
import { useRecording } from '@/hooks/useRecording';

export const RecordingList = ({ childId, onClose, onDownload }) => {
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [format, setFormat] = useState('mp4');
  const { useRecordings, downloadRecording } = useRecording();
  
  const { data, isLoading, error } = useRecordings({ 
    childId,
    limit: 50,
    sort: '-startTime'
  });

  const recordings = data?.recordings || [];

  const handleDownload = async (recording) => {
    try {
      await downloadRecording(recording._id, format);
      onDownload?.(recording);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4">
        <p>Error loading recordings: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white">Recordings</h4>
        <div className="flex items-center gap-2">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="bg-slate-700/50 rounded px-2 py-1 text-white text-xs border border-slate-600"
          >
            <option value="mp4">MP4</option>
            <option value="mkv">MKV</option>
            <option value="mov">MOV</option>
            <option value="avi">AVI</option>
          </select>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          <FileVideo className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recordings found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recordings.map((recording) => (
            <div
              key={recording._id}
              className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">
                    {recording.recordingName}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(recording.startTime), 'MMM d, h:mm a')}
                    </span>
                    <span>{formatDuration(recording.duration)}</span>
                    <span>{formatFileSize(recording.fileSize)}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      recording.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : recording.status === 'recording'
                        ? 'bg-red-500/20 text-red-400 animate-pulse'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {recording.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleDownload(recording)}
                    className="p-1.5 rounded hover:bg-blue-500/20 text-blue-400 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-slate-600/20 text-slate-400 transition-colors"
                    title="View"
                    onClick={() => setSelectedRecording(recording)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Storage info */}
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <HardDrive className="w-3 h-3" />
                <span>
                  {recording.storageType} • {recording.format.toUpperCase()} • {recording.resolution}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-4 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">{selectedRecording.recordingName}</h3>
              <button
                onClick={() => setSelectedRecording(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <video
                src={selectedRecording.storagePath}
                controls
                className="w-full h-full rounded-lg"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <span>{formatFileSize(selectedRecording.fileSize)}</span>
                <span>•</span>
                <span>{formatDuration(selectedRecording.duration)}</span>
                <span>•</span>
                <span>{selectedRecording.resolution}</span>
              </div>
              <button
                onClick={() => handleDownload(selectedRecording)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};