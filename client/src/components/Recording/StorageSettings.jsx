// // frontend/src/components/Recording/StorageSettings.jsx
// import React, { useState, useEffect } from 'react';
// import { useStorage } from '../../hooks/useStorage';
// import { 
//   HardDrive, 
//   Cloud, 
//   ExternalLink,
//   Plus,
//   Trash2,
//   RefreshCw,
//   Check,
//   X,
//   AlertCircle
// } from 'lucide-react';

// export const StorageSettings = ({ onClose, onStorageChange }) => {
//   const { 
//     config, 
//     usage, 
//     updateConfig, 
//     connectExternal, 
//     disconnectExternal,
//     loading 
//   } = useStorage();

//   const [localStorage, setLocalStorage] = useState({
//     enabled: true,
//     maxSize: 50,
//     autoDelete: false,
//     daysToKeep: 30
//   });
//   const [cloudStorage, setCloudStorage] = useState({
//     enabled: false,
//     provider: 'aws',
//     bucketName: '',
//     region: '',
//     maxSize: 100
//   });
//   const [externalDevices, setExternalDevices] = useState([]);
//   const [newDevice, setNewDevice] = useState({ name: '', path: '', type: 'hdd' });

//   useEffect(() => {
//     if (config) {
//       setLocalStorage(config.localStorage || localStorage);
//       setCloudStorage(config.cloudStorage || cloudStorage);
//       setExternalDevices(config.externalStorage?.devices || []);
//     }
//   }, [config]);

//   const handleSaveLocal = async () => {
//     await updateConfig({
//       localStorage: localStorage
//     });
//   };

//   const handleSaveCloud = async () => {
//     await updateConfig({
//       cloudStorage: cloudStorage
//     });
//   };

//   const handleConnectExternal = async () => {
//     await connectExternal(newDevice);
//     setNewDevice({ name: '', path: '', type: 'hdd' });
//   };

//   const handleDisconnectExternal = async (deviceId) => {
//     await disconnectExternal(deviceId);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-white">Storage Settings</h3>
//         <button onClick={onClose} className="text-slate-400 hover:text-white">
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Storage Usage */}
//       {usage && (
//         <div className="bg-slate-700/50 rounded-lg p-4">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-slate-300">Storage Usage</span>
//             <span className="text-sm text-slate-300">
//               {formatBytes(usage.used)} / {formatBytes(usage.total)}
//             </span>
//           </div>
//           <div className="w-full bg-slate-600 rounded-full h-2">
//             <div 
//               className={`h-2 rounded-full transition-all ${
//                 usage.percentage > 90 ? 'bg-red-500' :
//                 usage.percentage > 70 ? 'bg-yellow-500' :
//                 'bg-green-500'
//               }`}
//               style={{ width: `${Math.min(usage.percentage, 100)}%` }}
//             />
//           </div>
//           {usage.warnings?.map((warning, i) => (
//             <div key={i} className="mt-2 flex items-center gap-2 text-yellow-400 text-xs">
//               <AlertCircle className="w-3 h-3" />
//               {warning}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Local Storage */}
//       <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <HardDrive className="w-4 h-4 text-blue-400" />
//             <h4 className="text-sm font-medium text-white">Local Storage</h4>
//           </div>
//           <span className={`text-xs px-2 py-1 rounded ${
//             localStorage.enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'
//           }`}>
//             {localStorage.enabled ? 'Active' : 'Disabled'}
//           </span>
//         </div>

//         <div className="space-y-3">
//           <div className="flex items-center gap-4">
//             <label className="text-xs text-slate-300">Max Size (GB)</label>
//             <input
//               type="number"
//               value={localStorage.maxSize}
//               onChange={(e) => setLocalStorage({ ...localStorage, maxSize: parseInt(e.target.value) || 0 })}
//               className="bg-slate-700/50 rounded px-2 py-1 text-white text-sm w-24 border border-slate-600"
//               disabled={!localStorage.enabled}
//             />
//             <span className="text-xs text-slate-400">
//               Used: {usage?.breakdown?.local ? formatBytes(usage.breakdown.local.used) : '0 B'}
//             </span>
//           </div>

//           <div className="flex items-center gap-4">
//             <label className="text-xs text-slate-300">Auto Delete</label>
//             <button
//               onClick={() => setLocalStorage({ ...localStorage, autoDelete: !localStorage.autoDelete })}
//               className={`px-2 py-1 rounded text-xs ${
//                 localStorage.autoDelete ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'
//               }`}
//             >
//               {localStorage.autoDelete ? 'Enabled' : 'Disabled'}
//             </button>
//             {localStorage.autoDelete && (
//               <div className="flex items-center gap-2">
//                 <input
//                   type="number"
//                   value={localStorage.daysToKeep}
//                   onChange={(e) => setLocalStorage({ ...localStorage, daysToKeep: parseInt(e.target.value) || 0 })}
//                   className="bg-slate-700/50 rounded px-2 py-1 text-white text-sm w-16 border border-slate-600"
//                 />
//                 <span className="text-xs text-slate-400">days</span>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={handleSaveLocal}
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 rounded transition-colors"
//             disabled={loading}
//           >
//             {loading ? 'Saving...' : 'Save Local Settings'}
//           </button>
//         </div>
//       </div>

//       {/* Cloud Storage */}
//       <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <Cloud className="w-4 h-4 text-blue-400" />
//             <h4 className="text-sm font-medium text-white">Cloud Storage</h4>
//           </div>
//           <button
//             onClick={() => setCloudStorage({ ...cloudStorage, enabled: !cloudStorage.enabled })}
//             className={`text-xs px-2 py-1 rounded ${
//               cloudStorage.enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'
//             }`}
//           >
//             {cloudStorage.enabled ? 'Enabled' : 'Disabled'}
//           </button>
//         </div>

//         {cloudStorage.enabled && (
//           <div className="space-y-3">
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs text-slate-300 block mb-1">Provider</label>
//                 <select
//                   value={cloudStorage.provider}
//                   onChange={(e) => setCloudStorage({ ...cloudStorage, provider: e.target.value })}
//                   className="w-full bg-slate-700/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//                 >
//                   <option value="aws">AWS S3</option>
//                   <option value="gcp">Google Cloud</option>
//                   <option value="azure">Azure</option>
//                   <option value="digitalocean">DigitalOcean</option>
//                   <option value="dropbox">Dropbox</option>
//                   <option value="google-drive">Google Drive</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="text-xs text-slate-300 block mb-1">Bucket Name</label>
//                 <input
//                   type="text"
//                   value={cloudStorage.bucketName}
//                   onChange={(e) => setCloudStorage({ ...cloudStorage, bucketName: e.target.value })}
//                   className="w-full bg-slate-700/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="text-xs text-slate-300 block mb-1">Region</label>
//                 <input
//                   type="text"
//                   value={cloudStorage.region}
//                   onChange={(e) => setCloudStorage({ ...cloudStorage, region: e.target.value })}
//                   className="w-full bg-slate-700/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs text-slate-300 block mb-1">Max Size (GB)</label>
//                 <input
//                   type="number"
//                   value={cloudStorage.maxSize}
//                   onChange={(e) => setCloudStorage({ ...cloudStorage, maxSize: parseInt(e.target.value) || 0 })}
//                   className="w-full bg-slate-700/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={handleSaveCloud}
//               className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 rounded transition-colors"
//               disabled={loading}
//             >
//               {loading ? 'Saving...' : 'Save Cloud Settings'}
//             </button>
//           </div>
//         )}
//       </div>

//       {/* External Storage */}
//       <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <ExternalLink className="w-4 h-4 text-blue-400" />
//             <h4 className="text-sm font-medium text-white">External Storage</h4>
//           </div>
//           <span className="text-xs text-slate-400">
//             {externalDevices.filter(d => d.connected).length} connected
//           </span>
//         </div>

//         {/* Device List */}
//         <div className="space-y-2 mb-3">
//           {externalDevices.map(device => (
//             <div key={device.deviceId} className="flex items-center justify-between bg-slate-700/30 rounded p-2">
//               <div className="flex items-center gap-2">
//                 <HardDrive className="w-3 h-3 text-slate-400" />
//                 <span className="text-sm text-white">{device.name}</span>
//                 <span className="text-xs text-slate-400">{device.path}</span>
//                 <span className={`text-xs px-1 rounded ${
//                   device.connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
//                 }`}>
//                   {device.connected ? 'Connected' : 'Disconnected'}
//                 </span>
//               </div>
//               <button
//                 onClick={() => handleDisconnectExternal(device.deviceId)}
//                 className="text-red-400 hover:text-red-300"
//               >
//                 <Trash2 className="w-3 h-3" />
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Add Device */}
//         <div className="flex items-center gap-2">
//           <input
//             type="text"
//             placeholder="Device Name"
//             value={newDevice.name}
//             onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
//             className="bg-slate-700/50 rounded px-2 py-1 text-white text-sm flex-1 border border-slate-600"
//           />
//           <input
//             type="text"
//             placeholder="Path"
//             value={newDevice.path}
//             onChange={(e) => setNewDevice({ ...newDevice, path: e.target.value })}
//             className="bg-slate-700/50 rounded px-2 py-1 text-white text-sm flex-1 border border-slate-600"
//           />
//           <select
//             value={newDevice.type}
//             onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
//             className="bg-slate-700/50 rounded px-2 py-1 text-white text-sm border border-slate-600"
//           >
//             <option value="hdd">HDD</option>
//             <option value="ssd">SSD</option>
//             <option value="usb">USB</option>
//             <option value="nas">NAS</option>
//           </select>
//           <button
//             onClick={handleConnectExternal}
//             className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition-colors"
//             disabled={!newDevice.name || !newDevice.path}
//           >
//             <Plus className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Helper function to format bytes
// function formatBytes(bytes) {
//   if (bytes === 0) return '0 B';
//   const k = 1024;
//   const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// }




// frontend/src/components/Recording/StorageSettings.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  HardDrive, 
  Cloud, 
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';

export const StorageSettings = ({ onClose, onStorageChange }) => {
  const [storageType, setStorageType] = useState('local');
  const [settings, setSettings] = useState({
    local: {
      path: '/recordings',
      maxSize: '100',
      autoCleanup: true
    },
    cloud: {
      provider: 'aws',
      bucket: 'my-recordings',
      region: 'us-east-1',
      accessKey: '',
      secretKey: ''
    },
    external: {
      type: 'nfs',
      host: '',
      path: '/mnt/recordings',
      username: '',
      password: ''
    }
  });

  const handleSave = () => {
    onStorageChange(storageType);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Storage Type Selection */}
      <div className="flex gap-2">
        <Button
          variant={storageType === 'local' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStorageType('local')}
          className="flex-1"
        >
          <HardDrive className="w-4 h-4 mr-2" />
          Local
        </Button>
        <Button
          variant={storageType === 'cloud' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStorageType('cloud')}
          className="flex-1"
        >
          <Cloud className="w-4 h-4 mr-2" />
          Cloud
        </Button>
        <Button
          variant={storageType === 'external' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStorageType('external')}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          External
        </Button>
      </div>

      {/* Local Storage Settings */}
      {storageType === 'local' && (
        <div className="space-y-3">
          <div>
            <Label className="text-white/70">Storage Path</Label>
            <Input
              value={settings.local.path}
              onChange={(e) => setSettings({
                ...settings,
                local: { ...settings.local, path: e.target.value }
              })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white/70">Max Size (GB)</Label>
            <Input
              type="number"
              value={settings.local.maxSize}
              onChange={(e) => setSettings({
                ...settings,
                local: { ...settings.local, maxSize: e.target.value }
              })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.local.autoCleanup}
              onChange={(e) => setSettings({
                ...settings,
                local: { ...settings.local, autoCleanup: e.target.checked }
              })}
              className="w-4 h-4"
            />
            <Label className="text-white/70 text-sm">Auto cleanup old recordings</Label>
          </div>
        </div>
      )}

      {/* Cloud Storage Settings */}
      {storageType === 'cloud' && (
        <div className="space-y-3">
          <div>
            <Label className="text-white/70">Provider</Label>
            <select
              value={settings.cloud.provider}
              onChange={(e) => setSettings({
                ...settings,
                cloud: { ...settings.cloud, provider: e.target.value }
              })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white"
            >
              <option value="aws">AWS S3</option>
              <option value="gcp">Google Cloud Storage</option>
              <option value="azure">Azure Blob Storage</option>
            </select>
          </div>
          <div>
            <Label className="text-white/70">Bucket Name</Label>
            <Input
              value={settings.cloud.bucket}
              onChange={(e) => setSettings({
                ...settings,
                cloud: { ...settings.cloud, bucket: e.target.value }
              })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white/70">Region</Label>
            <Input
              value={settings.cloud.region}
              onChange={(e) => setSettings({
                ...settings,
                cloud: { ...settings.cloud, region: e.target.value }
              })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
        </div>
      )}

      {/* External Storage Settings */}
      {storageType === 'external' && (
        <div className="space-y-3">
          <div>
            <Label className="text-white/70">Storage Type</Label>
            <select
              value={settings.external.type}
              onChange={(e) => setSettings({
                ...settings,
                external: { ...settings.external, type: e.target.value }
              })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white"
            >
              <option value="nfs">NFS</option>
              <option value="smb">SMB/CIFS</option>
              <option value="ftp">FTP</option>
            </select>
          </div>
          <div>
            <Label className="text-white/70">Host</Label>
            <Input
              value={settings.external.host}
              onChange={(e) => setSettings({
                ...settings,
                external: { ...settings.external, host: e.target.value }
              })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white/70">Path</Label>
            <Input
              value={settings.external.path}
              onChange={(e) => setSettings({
                ...settings,
                external: { ...settings.external, path: e.target.value }
              })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-700">
        <Button onClick={handleSave} className="flex-1">
          <Check className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};