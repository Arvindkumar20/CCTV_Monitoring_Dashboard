// frontend/src/components/Recording/StorageTab.jsx
import React from 'react';
import {
  HardDrive,
  Cloud,
  ExternalLink,
  Database,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  FileVideo
} from 'lucide-react';

export const StorageTab = ({ config, usage, metrics }) => {
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

  const getUsageColor = (percentage) => {
    if (percentage > 90) return 'text-red-500';
    if (percentage > 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getUsageBarColor = (percentage) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

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
            {usage ? formatBytes(usage.total) : '0 B'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            All storage combined
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">Used Space</div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {usage ? formatBytes(usage.used) : '0 B'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {usage ? usage.percentage.toFixed(1) : 0}% of total
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">Available Space</div>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-500 mt-1">
            {usage ? formatBytes(usage.available) : '0 B'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Free space available
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Recordings</div>
            <FileVideo className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics?.totalRecordings || 0}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            All time recordings
          </div>
        </div>
      </div>

      {/* Storage Usage Chart */}
      {usage && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            Storage Usage Breakdown
          </h3>
          
          <div className="space-y-4">
            {usage.breakdown && Object.keys(usage.breakdown).map((key) => {
              const storage = usage.breakdown[key];
              const percentage = storage.percentage || 0;
              const isWarning = percentage > 85;
              const isCritical = percentage > 95;

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStorageTypeIcon(key)}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      {storage.name && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({storage.name})
                        </span>
                      )}
                      {isCritical && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {isWarning && !isCritical && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${getUsageColor(percentage)}`}>
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

      {/* Storage Recommendations */}
      {metrics?.recommendations && metrics.recommendations.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Storage Recommendations
              </h4>
              <ul className="mt-1 space-y-1">
                {metrics.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Storage Warnings */}
      {metrics?.warnings && metrics.warnings.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Storage Warnings
              </h4>
              <ul className="mt-1 space-y-1">
                {metrics.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-300">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Storage Config Summary */}
      {config && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            Storage Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <HardDrive className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Local Storage</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {config.localStorage.enabled ? (
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
                {config.cloudStorage.enabled ? (
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
                {config.externalStorage.enabled ? (
                  <>
                    <span className="text-green-500">Active</span>
                    <br />
                    Devices: {config.externalStorage.devices.filter(d => d.connected).length} connected
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

// Helper function
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}