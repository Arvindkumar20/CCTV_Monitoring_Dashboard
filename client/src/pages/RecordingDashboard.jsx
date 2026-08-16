// frontend/src/components/Recording/RecordingDashboard.jsx
import React, { useState, useEffect } from 'react';

import {
  Video,
  Settings,
  Camera,
  HardDrive,
  Cloud,
  Download,
  Trash2,
  Calendar,
  Filter,
  Search,
  Grid,
  List,
  ChevronDown,
  Plus,
  Play,
  Pause,
  Clock,
  FileVideo,
  ExternalLink,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  Square,
  CheckSquare,
  Eye,
  MoreVertical,
  X
} from 'lucide-react';
import { format } from 'date-fns';

import { useStorage } from '@/hooks/useStorage';
import { useRecording } from '@/hooks/useRecording';
import { useNVR } from '@/hooks/useNVR';
import { NVRConnection } from '@/components/Recording/NVRConnection';

// Main Dashboard Component
export const RecordingDashboard = ({ child, onClose }) => {
  const [activeTab, setActiveTab] = useState('recordings');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedRecordings, setSelectedRecordings] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNVR, setShowNVR] = useState(false);

  const { useRecordings, deleteRecording, bulkDeleteRecordings, downloadRecording } = useRecording();
  const { config, usage, metrics } = useStorage();
  const { devices, testConnection } = useNVR();

  // Get recordings with filters
  const { data, isLoading, refetch } = useRecordings({
    childId: child?.id,
    limit: 50,
    sort: '-startTime'
  });

  const recordings = data?.recordings || [];

  // Filter recordings
  const filteredRecordings = recordings.filter(recording => {
    if (searchTerm && !recording.recordingName?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      return new Date(recording.startTime).toDateString() === today;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(recording.startTime) >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(recording.startTime) >= monthAgo;
    }

    return true;
  });

  const handleSelectRecording = (recordingId) => {
    setSelectedRecordings(prev =>
      prev.includes(recordingId)
        ? prev.filter(id => id !== recordingId)
        : [...prev, recordingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecordings.length === filteredRecordings.length) {
      setSelectedRecordings([]);
    } else {
      setSelectedRecordings(filteredRecordings.map(r => r._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRecordings.length === 0) return;
    
    if (window.confirm(`Delete ${selectedRecordings.length} recordings?`)) {
      if (selectedRecordings.length === 1) {
        await deleteRecording(selectedRecordings[0]);
      } else {
        await bulkDeleteRecordings(selectedRecordings);
      }
      setSelectedRecordings([]);
      setShowDeleteModal(false);
      refetch();
    }
  };

  const handleDownloadSelected = async () => {
    for (const id of selectedRecordings) {
      await downloadRecording(id);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recording':
        return 'text-red-500 bg-red-500/10';
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Recording Center
              </h1>
              {child && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {child.name} • {child.class}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg ${
                  showSettings ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('recordings')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'recordings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Recordings
                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">
                  {filteredRecordings.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('nvr')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'nvr'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                NVR Devices
                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">
                  {devices?.length || 0}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'storage'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Storage
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {activeTab === 'recordings' && (
          <RecordingsTab
            recordings={filteredRecordings}
            isLoading={isLoading}
            selectedRecordings={selectedRecordings}
            onSelectRecording={handleSelectRecording}
            onSelectAll={handleSelectAll}
            onDeleteSelected={handleDeleteSelected}
            onDownloadSelected={handleDownloadSelected}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onDownload={downloadRecording}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === 'nvr' && (
          <NVRDevicesTab
            devices={devices}
            onTestConnection={testConnection}
          />
        )}

        {activeTab === 'storage' && (
          <StorageTab
            config={config}
            usage={usage}
            metrics={metrics}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          child={child}
        />
      )}
    </div>
  );
};

// Recordings Tab Component
const RecordingsTab = ({
  recordings,
  isLoading,
  selectedRecordings,
  onSelectRecording,
  onSelectAll,
  onDeleteSelected,
  onDownloadSelected,
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  viewMode,
  onViewModeChange,
  onDownload,
  formatDuration,
  formatFileSize,
  getStatusColor
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['today', 'week', 'month', 'all'].map((filter) => (
              <button
                key={filter}
                onClick={() => onDateFilterChange(filter)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                  dateFilter === filter
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-600 shadow-sm'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-600 shadow-sm'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {selectedRecordings.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  {selectedRecordings.length} selected
                </span>
                <button
                  onClick={onDownloadSelected}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onDeleteSelected}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recordings Grid/List */}
      {recordings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12 text-center">
          <FileVideo className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Recordings Found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Start recording to see your videos here
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recordings.map((recording) => (
            <RecordingCard
              key={recording._id}
              recording={recording}
              isSelected={selectedRecordings.includes(recording._id)}
              onSelect={onSelectRecording}
              onDownload={onDownload}
              formatDuration={formatDuration}
              formatFileSize={formatFileSize}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button onClick={onSelectAll} className="flex items-center gap-2">
                      {selectedRecordings.length === recordings.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Recording</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {recordings.map((recording) => (
                  <RecordingRow
                    key={recording._id}
                    recording={recording}
                    isSelected={selectedRecordings.includes(recording._id)}
                    onSelect={onSelectRecording}
                    onDownload={onDownload}
                    formatDuration={formatDuration}
                    formatFileSize={formatFileSize}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Recording Card Component (Grid View)
const RecordingCard = ({
  recording,
  isSelected,
  onSelect,
  onDownload,
  formatDuration,
  formatFileSize,
  getStatusColor
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border-2 transition-all ${
      isSelected ? 'border-blue-500' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
    }`}>
      <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative">
        {recording.thumbnail ? (
          <img src={recording.thumbnail} alt={recording.recordingName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileVideo className="w-12 h-12 text-slate-400" />
          </div>
        )}
        
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(recording.status)}`}>
          {recording.status}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-white text-xs">
          {formatDuration(recording.duration)}
        </div>
        <button
          onClick={() => onSelect(recording._id)}
          className="absolute top-2 left-2 p-1 bg-black/50 rounded hover:bg-black/70 transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-white" />
          ) : (
            <Square className="w-4 h-4 text-white/70" />
          )}
        </button>
      </div>

      <div className="p-3">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {recording.recordingName}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {format(new Date(recording.startTime), 'MMM d, h:mm a')}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatFileSize(recording.fileSize)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onDownload(recording._id)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
          <button className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Recording Row Component (List View)
const RecordingRow = ({
  recording,
  isSelected,
  onSelect,
  onDownload,
  formatDuration,
  formatFileSize,
  getStatusColor
}) => {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-4 py-3">
        <button onClick={() => onSelect(recording._id)}>
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-blue-500" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center flex-shrink-0">
            <FileVideo className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {recording.recordingName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {recording.resolution} • {recording.format?.toUpperCase()}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        {format(new Date(recording.startTime), 'MMM d, yyyy')}
        <br />
        <span className="text-xs text-slate-400">
          {format(new Date(recording.startTime), 'h:mm a')}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        {formatDuration(recording.duration)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        {formatFileSize(recording.fileSize)}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(recording.status)}`}>
          {recording.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onDownload(recording._id)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-slate-500" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="View">
            <Eye className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// NVR Devices Tab Component
const NVRDevicesTab = ({ devices, onTestConnection }) => {
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [showAddNVR, setShowAddNVR] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-500 bg-green-500/10';
      case 'disconnected':
        return 'text-red-500 bg-red-500/10';
      case 'connecting':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  if (!devices || devices.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12 text-center border border-slate-200 dark:border-slate-700">
        <Server className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No NVR Devices</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Add your first NVR device to start recording
        </p>
        <button
          onClick={() => setShowAddNVR(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add NVR Device
        </button>
        {showAddNVR && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <NVRConnection
                onClose={() => setShowAddNVR(false)}
                onConnect={() => setShowAddNVR(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">NVR Devices</h3>
        <button
          onClick={() => setShowAddNVR(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add NVR Device
        </button>
      </div>

      {devices.map((device) => (
        <div
          key={device._id}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div
            className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            onClick={() => setExpandedDevice(expandedDevice === device._id ? null : device._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">{device.deviceName}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span>{device.ipAddress}:{device.port}</span>
                    <span>•</span>
                    <span>{device.brand}</span>
                    <span>•</span>
                    <span>{device.totalCameras} cameras</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(device.connectionStatus)}`}>
                  {getStatusIcon(device.connectionStatus)}
                  {device.connectionStatus}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestConnection(device._id);
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {expandedDevice === device._id && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Cameras</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {device.cameras?.map((camera) => (
                  <div key={camera.cameraId} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{camera.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        camera.enabled ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'
                      }`}>
                        {camera.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div>Channel: {camera.channel}</div>
                      <div>Resolution: {camera.resolution}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                          camera.recordingEnabled
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {camera.recordingEnabled ? (
                          <>
                            <Square className="w-3 h-3" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            Record
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {showAddNVR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <NVRConnection
              onClose={() => setShowAddNVR(false)}
              onConnect={() => setShowAddNVR(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Storage Tab Component
const StorageTab = ({ config, usage, metrics }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageTypeIcon = (type) => {
    switch (type) {
      case 'local':
        return <HardDrive className="w-5 h-5" />;
      case 'cloud':
        return <Cloud className="w-5 h-5" />;
      case 'external':
        return <ExternalLink className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const getUsageBarColor = (percentage) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!usage) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Storage</div>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatBytes(usage.total)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">All storage combined</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">Used Space</div>
            <HardDrive className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatBytes(usage.used)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {usage.percentage?.toFixed(1) || 0}% of total
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">Available Space</div>
            <CheckSquare className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-500 mt-1">
            {formatBytes(usage.available)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Free space available</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Recordings</div>
            <FileVideo className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics?.totalRecordings || 0}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">All time recordings</div>
        </div>
      </div>

      {/* Storage Usage Breakdown */}
      {usage.breakdown && Object.keys(usage.breakdown).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Storage Usage Breakdown</h3>
          <div className="space-y-4">
            {Object.keys(usage.breakdown).map((key) => {
              const storage = usage.breakdown[key];
              const percentage = storage.percentage || 0;

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStorageTypeIcon(key)}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      {storage.name && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">({storage.name})</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getUsageBarColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatBytes(storage.used)} used</span>
                    <span>of {formatBytes(storage.max)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Storage Config Summary */}
      {config && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Storage Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <HardDrive className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Local Storage</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {config.localStorage?.enabled ? (
                  <>
                    <span className="text-green-500">Active</span>
                    <br />
                    Max: {config.localStorage.maxSize} GB
                    {config.localStorage.autoDelete && (
                      <>
                        <br />
                        Auto-delete: {config.localStorage.daysToKeep} days
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-red-500">Disabled</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Cloud className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cloud Storage</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {config.cloudStorage?.enabled ? (
                  <>
                    <span className="text-green-500">Active</span>
                    <br />
                    Provider: {config.cloudStorage.provider}
                    <br />
                    Max: {config.cloudStorage.maxSize} GB
                  </>
                ) : (
                  <span className="text-red-500">Disabled</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ExternalLink className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">External Storage</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {config.externalStorage?.enabled ? (
                  <>
                    <span className="text-green-500">Active</span>
                    <br />
                    Devices: {config.externalStorage.devices?.filter(d => d.connected).length || 0} connected
                  </>
                ) : (
                  <span className="text-red-500">Disabled</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Modal Component
const SettingsModal = ({ onClose, child }) => {
  const { config, updateConfig, isLoading } = useStorage();
  const [settings, setSettings] = useState(config || {});

  const handleSave = async () => {
    await updateConfig(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recording Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Recording Settings */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Recording Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Default Format</label>
                <select
                  value={settings.recordingSettings?.defaultFormat || 'mp4'}
                  onChange={(e) => setSettings({
                    ...settings,
                    recordingSettings: { ...settings.recordingSettings, defaultFormat: e.target.value }
                  })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="mp4">MP4</option>
                  <option value="mkv">MKV</option>
                  <option value="mov">MOV</option>
                  <option value="avi">AVI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Default Resolution</label>
                <select
                  value={settings.recordingSettings?.defaultResolution || '1080p'}
                  onChange={(e) => setSettings({
                    ...settings,
                    recordingSettings: { ...settings.recordingSettings, defaultResolution: e.target.value }
                  })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>
            </div>
          </div>

          {/* Storage Settings */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Storage Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Local Storage</span>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      localStorage: { ...settings.localStorage, enabled: !settings.localStorage?.enabled }
                    })}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      settings.localStorage?.enabled ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'
                    }`}
                  >
                    {settings.localStorage?.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {settings.localStorage?.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Max Size (GB)</label>
                      <input
                        type="number"
                        value={settings.localStorage.maxSize || 50}
                        onChange={(e) => setSettings({
                          ...settings,
                          localStorage: { ...settings.localStorage, maxSize: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Auto Delete (days)</label>
                      <input
                        type="number"
                        value={settings.localStorage.daysToKeep || 30}
                        onChange={(e) => setSettings({
                          ...settings,
                          localStorage: { ...settings.localStorage, daysToKeep: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Export all components
export default RecordingDashboard;