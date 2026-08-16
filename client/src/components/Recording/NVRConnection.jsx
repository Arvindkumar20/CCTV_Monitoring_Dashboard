// // frontend/src/components/Recording/NVRConnection.jsx
// import React, { useState, useEffect } from 'react';
// import { useNVR } from '../../hooks/useNVR';
// import { 
//   Camera, 
//   Plus, 
//   Trash2, 
//   RefreshCw,
//   Check,
//   X,
//   Wifi,
//   WifiOff,
//   Settings
// } from 'lucide-react';

// export const NVRConnection = ({ onClose, onConnect }) => {
//   const { devices, addDevice, updateDevice, deleteDevice, testConnection, loading } = useNVR();
  
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newDevice, setNewDevice] = useState({
//     deviceName: '',
//     brand: 'generic',
//     ipAddress: '',
//     port: 80,
//     username: '',
//     password: '',
//     protocol: 'onvif'
//   });
//   const [testingDevice, setTestingDevice] = useState(null);

//   const handleAddDevice = async () => {
//     try {
//       await addDevice(newDevice);
//       setNewDevice({
//         deviceName: '',
//         brand: 'generic',
//         ipAddress: '',
//         port: 80,
//         username: '',
//         password: '',
//         protocol: 'onvif'
//       });
//       setShowAddForm(false);
//       onConnect?.();
//     } catch (error) {
//       console.error('Failed to add NVR device:', error);
//     }
//   };

//   const handleTestConnection = async (deviceId) => {
//     try {
//       setTestingDevice(deviceId);
//       await testConnection(deviceId);
//     } catch (error) {
//       console.error('Connection test failed:', error);
//     } finally {
//       setTestingDevice(null);
//     }
//   };

//   const handleDeleteDevice = async (deviceId) => {
//     if (window.confirm('Are you sure you want to remove this NVR device?')) {
//       await deleteDevice(deviceId);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-white">NVR Devices</h3>
//         <button onClick={onClose} className="text-slate-400 hover:text-white">
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Device List */}
//       <div className="space-y-2">
//         {devices.map(device => (
//           <div key={device._id} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Camera className="w-4 h-4 text-blue-400" />
//                 <div>
//                   <div className="text-white font-medium">{device.deviceName}</div>
//                   <div className="text-xs text-slate-400">
//                     {device.ipAddress}:{device.port} • {device.brand} • {device.totalCameras} cameras
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className={`text-xs px-2 py-1 rounded ${
//                   device.connectionStatus === 'connected' 
//                     ? 'bg-green-500/20 text-green-400' 
//                     : device.connectionStatus === 'error'
//                     ? 'bg-red-500/20 text-red-400'
//                     : 'bg-yellow-500/20 text-yellow-400'
//                 }`}>
//                   {device.connectionStatus}
//                 </span>
//                 <button
//                   onClick={() => handleTestConnection(device._id)}
//                   className="text-blue-400 hover:text-blue-300"
//                   disabled={testingDevice === device._id}
//                 >
//                   <RefreshCw className={`w-4 h-4 ${testingDevice === device._id ? 'animate-spin' : ''}`} />
//                 </button>
//                 <button
//                   onClick={() => handleDeleteDevice(device._id)}
//                   className="text-red-400 hover:text-red-300"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             {/* Cameras */}
//             {device.cameras && device.cameras.length > 0 && (
//               <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
//                 {device.cameras.map(camera => (
//                   <div key={camera.cameraId} className="bg-slate-800/50 rounded p-2">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-white">{camera.name}</span>
//                       <span className={`text-xs ${
//                         camera.enabled ? 'text-green-400' : 'text-slate-500'
//                       }`}>
//                         {camera.enabled ? 'Active' : 'Disabled'}
//                       </span>
//                     </div>
//                     <div className="text-xs text-slate-400">
//                       Ch: {camera.channel} • {camera.resolution}
//                     </div>
//                     <div className="flex items-center gap-2 mt-1">
//                       <button
//                         onClick={() => {
//                           // Toggle camera recording
//                           updateDevice(device._id, {
//                             cameras: device.cameras.map(c => 
//                               c.cameraId === camera.cameraId 
//                                 ? { ...c, recordingEnabled: !c.recordingEnabled }
//                                 : c
//                             )
//                           });
//                         }}
//                         className={`text-xs px-2 py-0.5 rounded ${
//                           camera.recordingEnabled 
//                             ? 'bg-red-500/20 text-red-400' 
//                             : 'bg-slate-600/20 text-slate-400'
//                         }`}
//                       >
//                         {camera.recordingEnabled ? 'Recording' : 'Start Recording'}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Add Device Form */}
//       {showAddForm ? (
//         <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
//           <h4 className="text-sm font-medium text-white mb-3">Add NVR Device</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs text-slate-300 block mb-1">Device Name</label>
//               <input
//                 type="text"
//                 value={newDevice.deviceName}
//                 onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
//                 className="w-full bg-slate-800/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//                 placeholder="My NVR"
//               />
//             </div>
//             <div>
//               <label className="text-xs text-slate-300 block mb-1">Brand</label>
//               <select
//                 value={newDevice.brand}
//                 onChange={(e) => setNewDevice({ ...newDevice, brand: e.target.value })}
//                 className="w-full bg-slate-800/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//               >
//                 <option value="hikvision">Hikvision</option>
//                 <option value="dahua">Dahua</option>
//                 <option value="ubiquiti">Ubiquiti</option>
//                 <option value="axis">Axis</option>
//                 <option value="generic">Generic</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-xs text-slate-300 block mb-1">IP Address</label>
//               <input
//                 type="text"
//                 value={newDevice.ipAddress}
//                 onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
//                 className="w-full bg-slate-800/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//                 placeholder="192.168.1.100"
//               />
//             </div>
//             <div>
//               <label className="text-xs text-slate-300 block mb-1">Port</label>
//               <input
//                 type="number"
//                 value={newDevice.port}
//                 onChange={(e) => setNewDevice({ ...newDevice, port: parseInt(e.target.value) || 80 })}
//                 className="w-full bg-slate-800/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//               />
//             </div>
//             <div>
//               <label className="text-xs text-slate-300 block mb-1">Username</label>
//               <input
//                 type="text"
//                 value={newDevice.username}
//                 onChange={(e) => setNewDevice({ ...newDevice, username: e.target.value })}
//                 className="w-full bg-slate-800/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//                 placeholder="admin"
//               />
//             </div>
//             <div>
//               <label className="text-xs text-slate-300 block mb-1">Password</label>
//               <input
//                 type="password"
//                 value={newDevice.password}
//                 onChange={(e) => setNewDevice({ ...newDevice, password: e.target.value })}
//                 className="w-full bg-slate-800/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//                 placeholder="••••••••"
//               />
//             </div>
//             <div>
//               <label className="text-xs text-slate-300 block mb-1">Protocol</label>
//               <select
//                 value={newDevice.protocol}
//                 onChange={(e) => setNewDevice({ ...newDevice, protocol: e.target.value })}
//                 className="w-full bg-slate-800/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//               >
//                 <option value="onvif">ONVIF</option>
//                 <option value="rtsp">RTSP</option>
//                 <option value="http">HTTP</option>
//                 <option value="https">HTTPS</option>
//               </select>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 mt-3">
//             <button
//               onClick={handleAddDevice}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm transition-colors"
//               disabled={loading}
//             >
//               {loading ? 'Adding...' : 'Add Device'}
//             </button>
//             <button
//               onClick={() => setShowAddForm(false)}
//               className="bg-slate-600/50 hover:bg-slate-600 text-white px-4 py-1 rounded text-sm transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       ) : (
//         <button
//           onClick={() => setShowAddForm(true)}
//           className="w-full bg-slate-700/30 hover:bg-slate-700/50 border border-dashed border-slate-600 rounded-lg p-3 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
//         >
//           <Plus className="w-4 h-4" />
//           Add NVR Device
//         </button>
//       )}
//     </div>
//   );
// };


// frontend/src/components/Recording/NVRConnection.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  Wifi, 
  Check, 
  AlertCircle,
  RefreshCw,
  Server
} from 'lucide-react';

export const NVRConnection = ({ onClose, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [config, setConfig] = useState({
    host: '',
    port: '554',
    username: '',
    password: '',
    protocol: 'rtsp'
  });

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('connected');
      onConnect(config);
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-white/30';
    }
  };

  const getStatusLabel = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Failed';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Server className={`w-5 h-5 ${getStatusColor()}`} />
          <span className="text-white font-medium">NVR Connection</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className={`text-sm ${getStatusColor()}`}>{getStatusLabel()}</span>
        </div>
      </div>

      {/* Connection Settings */}
      <div className="space-y-3">
        <div>
          <Label className="text-white/70">Protocol</Label>
          <select
            value={config.protocol}
            onChange={(e) => setConfig({ ...config, protocol: e.target.value })}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white"
          >
            <option value="rtsp">RTSP</option>
            <option value="rtmp">RTMP</option>
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
          </select>
        </div>
        <div>
          <Label className="text-white/70">Host / IP Address</Label>
          <Input
            placeholder="192.168.1.100"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            className="bg-slate-700/50 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label className="text-white/70">Port</Label>
          <Input
            placeholder="554"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
            className="bg-slate-700/50 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label className="text-white/70">Username</Label>
          <Input
            placeholder="admin"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            className="bg-slate-700/50 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label className="text-white/70">Password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            className="bg-slate-700/50 border-slate-600 text-white"
          />
        </div>
      </div>

      {/* Camera Discovery */}
      <div className="flex items-center gap-2 p-3 bg-slate-700/20 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          className="text-white/50 hover:text-white"
          onClick={() => {}}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Scan for Cameras
        </Button>
        <span className="text-white/30 text-xs">Auto-discovery on network</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-700">
        <Button 
          onClick={handleConnect}
          disabled={isConnecting || !config.host}
          className="flex-1"
        >
          {isConnecting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : connectionStatus === 'connected' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Connected
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Connect NVR
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Error Message */}
      {connectionStatus === 'error' && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          Failed to connect. Please check your settings and try again.
        </div>
      )}
    </div>
  );
};