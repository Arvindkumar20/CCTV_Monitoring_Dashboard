// frontend/src/components/Recording/RecordingList.jsx
import React, { useState } from 'react';
import { 
  Download, 
  Play, 
  Trash2, 
  Calendar,
  Clock,
  FileVideo,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRecording } from '@/hooks/useRecording';
import { format } from 'date-fns';

export const RecordingList = ({ childId, onClose, onDownload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const { useRecordings, deleteRecording } = useRecording();
  const { data: recordings, isLoading, refetch } = useRecordings({ 
    childId,
    search: searchTerm,
    date: filterDate
  });

  const handleDelete = async (recordingId) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(recordingId);
        refetch();
      } catch (error) {
        console.error('Failed to delete recording:', error);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <div className="text-center py-8">
        <FileVideo className="w-12 h-12 mx-auto text-white/20 mb-3" />
        <p className="text-white/50">No recordings found</p>
        <p className="text-white/30 text-sm">Start recording to save videos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search recordings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder:text-white/30"
            />
          </div>
        </div>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-40 bg-slate-700/50 border-slate-600 text-white"
        />
      </div>

      {/* Recording List */}
      <div className="space-y-2">
        {recordings.map((recording) => (
          <div 
            key={recording._id}
            className="flex flex-wrap items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            {/* Thumbnail/Icon */}
            <div className="w-16 h-12 bg-slate-800 rounded flex items-center justify-center flex-shrink-0">
              {recording.thumbnail ? (
                <img 
                  src={recording.thumbnail} 
                  alt={recording.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <FileVideo className="w-6 h-6 text-white/30" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-[150px]">
              <p className="text-white text-sm font-medium truncate">
                {recording.name || `Recording ${format(new Date(recording.createdAt), 'PPp')}`}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(recording.createdAt), 'PP')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(recording.createdAt), 'p')}
                </span>
                <span>•</span>
                <span>{recording.duration || '00:00'}</span>
                <span>•</span>
                <span>{formatFileSize(recording.size || 0)}</span>
                {recording.resolution && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-[10px]">
                      {recording.resolution}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(recording._id)}
                className="text-white/50 hover:text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/recordings/${recording._id}/play`, '_blank')}
                className="text-white/50 hover:text-white"
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(recording._id)}
                className="text-red-400/50 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};