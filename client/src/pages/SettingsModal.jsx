// frontend/src/components/Recording/SettingsModal.jsx
import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import {
  X,
  HardDrive,
  Cloud,
  ExternalLink,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const SettingsModal = ({ onClose, child }) => {
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

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Recording Settings */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Recording Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
                  Default Format
                </label>
                <select
                  value={settings.recordingSettings?.defaultFormat || 'mp4'}
                  onChange={(e) => setSettings({
                    ...settings,
                    recordingSettings: {
                      ...settings.recordingSettings,
                      defaultFormat: e.target.value
                    }
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
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
                  Default Resolution
                </label>
                <select
                  value={settings.recordingSettings?.defaultResolution || '1080p'}
                  onChange={(e) => setSettings({
                    ...settings,
                    recordingSettings: {
                      ...settings.recordingSettings,
                      defaultResolution: e.target.value
                    }
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
              {/* Local Storage */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Local Storage</span>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      localStorage: {
                        ...settings.localStorage,
                        enabled: !settings.localStorage?.enabled
                      }
                    })}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      settings.localStorage?.enabled
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-slate-500/20 text-slate-500'
                    }`}
                  >
                    {settings.localStorage?.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {settings.localStorage?.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Max Size (GB)
                      </label>
                      <input
                        type="number"
                        value={settings.localStorage.maxSize || 50}
                        onChange={(e) => setSettings({
                          ...settings,
                          localStorage: {
                            ...settings.localStorage,
                            maxSize: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Auto Delete After (days)
                      </label>
                      <input
                        type="number"
                        value={settings.localStorage.daysToKeep || 30}
                        onChange={(e) => setSettings({
                          ...settings,
                          localStorage: {
                            ...settings.localStorage,
                            daysToKeep: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cloud Storage */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Cloud Storage</span>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      cloudStorage: {
                        ...settings.cloudStorage,
                        enabled: !settings.cloudStorage?.enabled
                      }
                    })}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      settings.cloudStorage?.enabled
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-slate-500/20 text-slate-500'
                    }`}
                  >
                    {settings.cloudStorage?.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {settings.cloudStorage?.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Provider
                      </label>
                      <select
                        value={settings.cloudStorage.provider || 'aws'}
                        onChange={(e) => setSettings({
                          ...settings,
                          cloudStorage: {
                            ...settings.cloudStorage,
                            provider: e.target.value
                          }
                        })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                      >
                        <option value="aws">AWS S3</option>
                        <option value="gcp">Google Cloud</option>
                        <option value="azure">Azure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Max Size (GB)
                      </label>
                      <input
                        type="number"
                        value={settings.cloudStorage.maxSize || 100}
                        onChange={(e) => setSettings({
                          ...settings,
                          cloudStorage: {
                            ...settings.cloudStorage,
                            maxSize: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* External Storage */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">External Storage</span>
                  </div>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      externalStorage: {
                        ...settings.externalStorage,
                        enabled: !settings.externalStorage?.enabled
                      }
                    })}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      settings.externalStorage?.enabled
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-slate-500/20 text-slate-500'
                    }`}
                  >
                    {settings.externalStorage?.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Retention Policy */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Retention Policy</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-700 dark:text-slate-300">Auto-delete old recordings</span>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    retentionPolicy: {
                      ...settings.retentionPolicy,
                      enabled: !settings.retentionPolicy?.enabled
                    }
                  })}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    settings.retentionPolicy?.enabled
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-slate-500/20 text-slate-500'
                  }`}
                >
                  {settings.retentionPolicy?.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {settings.retentionPolicy?.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Max Age (days)
                    </label>
                    <input
                      type="number"
                      value={settings.retentionPolicy.maxAge || 90}
                      onChange={(e) => setSettings({
                        ...settings,
                        retentionPolicy: {
                          ...settings.retentionPolicy,
                          maxAge: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Max Storage Usage (%)
                    </label>
                    <input
                      type="number"
                      value={settings.retentionPolicy.maxStorageUsage || 85}
                      onChange={(e) => setSettings({
                        ...settings,
                        retentionPolicy: {
                          ...settings.retentionPolicy,
                          maxStorageUsage: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
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