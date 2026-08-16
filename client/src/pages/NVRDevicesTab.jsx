// frontend/src/components/Recording/NVRDevicesTab.jsx
import React, { useState } from 'react';
import {
  Server,
  Camera,
  Plus,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
  Settings,
  Play,
  Square,
  MoreVertical,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { NVRConnection } from './NVRConnection';

export const NVRDevicesTab = ({ devices, onTestConnection }) => {
  const [showAddNVR, setShowAddNVR] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState(null);

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            NVR Devices
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your NVR devices and cameras
          </p>
        </div>
        <button
          onClick={() => setShowAddNVR(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add NVR Device
        </button>
      </div>

      {/* Device List */}
      {devices && devices.length > 0 ? (
        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device._id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Device Header */}
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
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {device.deviceName}
                      </h3>
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
                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded View - Cameras */}
              {expandedDevice === device._id && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Cameras
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {device.cameras.map((camera) => (
                      <div
                        key={camera.cameraId}
                        className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {camera.name}
                            </span>
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
                          {camera.streamUrl && (
                            <div className="truncate">Stream: {camera.streamUrl}</div>
                          )}
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
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                Start Recording
                              </>
                            )}
                          </button>
                          <button className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                            <Settings className="w-3 h-3 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Device Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {device.totalCameras}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Total Cameras</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {device.onlineCameras || 0}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Online Cameras</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {device.cameras.filter(c => c.recordingEnabled).length}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Recording</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
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
        </div>
      )}

      {/* Add NVR Modal */}
      {showAddNVR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <NVRConnection
              onClose={() => setShowAddNVR(false)}
              onConnect={() => {
                setShowAddNVR(false);
                // Refresh devices
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};