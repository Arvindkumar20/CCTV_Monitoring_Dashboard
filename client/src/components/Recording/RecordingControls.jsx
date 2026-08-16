// // frontend/src/components/Recording/RecordingControls.jsx
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { 
//   Play, 
//   Square, 
//   Download, 
//   Settings,
//   Camera,
//   HardDrive,
//   Cloud,
//   ExternalLink
// } from 'lucide-react';
// import { useRecording } from '@/hooks/useRecording';
// import { StorageSettings } from './StorageSettings';
// import { RecordingList } from '@/pages/RecordingList';
// import { NVRConnection } from './NVRConnection';


// export const RecordingControls = ({ child, onRecordingStart, onRecordingStop }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [showStorageSettings, setShowStorageSettings] = useState(false);
//   const [showRecordings, setShowRecordings] = useState(false);
//   const [showNVR, setShowNVR] = useState(false);
//   const [selectedStorage, setSelectedStorage] = useState('local');
  
//   const { startRecording, stopRecording, downloadRecording } = useRecording();

//   const handleStartRecording = async () => {
//     try {
//       await startRecording({
//         childId: child.id,
//         cameraId: child.cameraId,
//         storageType: selectedStorage,
//         format: 'mp4',
//         resolution: '1080p'
//       });
//       setIsRecording(true);
//       onRecordingStart?.();
//     } catch (error) {
//       console.error('Failed to start recording:', error);
//     }
//   };

//   const handleStopRecording = async () => {
//     try {
//       await stopRecording();
//       setIsRecording(false);
//       onRecordingStop?.();
//     } catch (error) {
//       console.error('Failed to stop recording:', error);
//     }
//   };

//   return (
//     <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
//       <div className="flex flex-wrap items-center gap-3">
//         {/* Recording Controls */}
//         <div className="flex items-center gap-2">
//           <Button
//             variant={isRecording ? "destructive" : "default"}
//             size="sm"
//             onClick={isRecording ? handleStopRecording : handleStartRecording}
//             className="min-w-[80px]"
//           >
//             {isRecording ? (
//               <>
//                 <Square className="w-4 h-4 mr-2" />
//                 Stop
//               </>
//             ) : (
//               <>
//                 <Play className="w-4 h-4 mr-2" />
//                 Record
//               </>
//             )}
//           </Button>

//           {isRecording && (
//             <div className="flex items-center gap-1 text-red-500">
//               <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//               <span className="text-xs font-medium">REC</span>
//             </div>
//           )}
//         </div>

//         {/* Storage Selector */}
//         <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
//           <Button
//             variant={selectedStorage === 'local' ? 'default' : 'ghost'}
//             size="sm"
//             onClick={() => setSelectedStorage('local')}
//             className="text-xs"
//           >
//             <HardDrive className="w-3 h-3 mr-1" />
//             Local
//           </Button>
//           <Button
//             variant={selectedStorage === 'cloud' ? 'default' : 'ghost'}
//             size="sm"
//             onClick={() => setSelectedStorage('cloud')}
//             className="text-xs"
//           >
//             <Cloud className="w-3 h-3 mr-1" />
//             Cloud
//           </Button>
//           <Button
//             variant={selectedStorage === 'external' ? 'default' : 'ghost'}
//             size="sm"
//             onClick={() => setSelectedStorage('external')}
//             className="text-xs"
//           >
//             <ExternalLink className="w-3 h-3 mr-1" />
//             External
//           </Button>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center gap-2 ml-auto">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowStorageSettings(!showStorageSettings)}
//           >
//             <Settings className="w-4 h-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowRecordings(!showRecordings)}
//           >
//             <Download className="w-4 h-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowNVR(!showNVR)}
//           >
//             <Camera className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Storage Settings Panel */}
//       {showStorageSettings && (
//         <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
//           <StorageSettings 
//             onClose={() => setShowStorageSettings(false)}
//             onStorageChange={setSelectedStorage}
//           />
//         </div>
//       )}

//       {/* Recordings List */}
//       {showRecordings && (
//         <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
//           <RecordingList
//             childId={child.id}
//             onClose={() => setShowRecordings(false)}
//             onDownload={downloadRecording}
//           />
//         </div>
//       )}

//       {/* NVR Connection */}
//       {showNVR && (
//         <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
//           <NVRConnection 
//             onClose={() => setShowNVR(false)}
//             onConnect={() => {}}
//           />
//         </div>
//       )}
//     </div>
//   );
// };



// // frontend/src/components/Recording/RecordingControls.jsx
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { 
//   Play, 
//   Square, 
//   Download, 
//   Settings,
//   Camera,
//   HardDrive,
//   Cloud,
//   ExternalLink,
//   X
// } from 'lucide-react';
// import { useRecording } from '@/hooks/useRecording';
// import { StorageSettings } from './StorageSettings';
// import { RecordingList } from './RecordingList';
// import { NVRConnection } from './NVRConnection';

// export const RecordingControls = ({ child, onRecordingStart, onRecordingStop }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [showStorageSettings, setShowStorageSettings] = useState(false);
//   const [showRecordings, setShowRecordings] = useState(false);
//   const [showNVR, setShowNVR] = useState(false);
//   const [selectedStorage, setSelectedStorage] = useState('local');
  
//   const { startRecording, stopRecording, downloadRecording } = useRecording();

//   const handleStartRecording = async () => {
//     try {
//       await startRecording({
//         childId: child?._id || child?.id,
//         cameraId: child?.cameraId || child?._id,
//         storageType: selectedStorage,
//         format: 'mp4',
//         resolution: '1080p'
//       });
//       setIsRecording(true);
//       onRecordingStart?.();
//     } catch (error) {
//       console.error('Failed to start recording:', error);
//     }
//   };

//   const handleStopRecording = async () => {
//     try {
//       await stopRecording();
//       setIsRecording(false);
//       onRecordingStop?.();
//     } catch (error) {
//       console.error('Failed to stop recording:', error);
//     }
//   };

//   return (
//     <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700 min-w-[300px]">
//       <div className="flex flex-wrap items-center gap-3">
//         {/* Recording Controls */}
//         <div className="flex items-center gap-2">
//           <Button
//             variant={isRecording ? "destructive" : "default"}
//             size="sm"
//             onClick={isRecording ? handleStopRecording : handleStartRecording}
//             className="min-w-[80px]"
//           >
//             {isRecording ? (
//               <>
//                 <Square className="w-4 h-4 mr-2" />
//                 Stop
//               </>
//             ) : (
//               <>
//                 <Play className="w-4 h-4 mr-2" />
//                 Record
//               </>
//             )}
//           </Button>

//           {isRecording && (
//             <div className="flex items-center gap-1 text-red-500">
//               <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//               <span className="text-xs font-medium">REC</span>
//             </div>
//           )}
//         </div>

//         {/* Storage Selector */}
//         <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
//           <Button
//             variant={selectedStorage === 'local' ? 'default' : 'ghost'}
//             size="sm"
//             onClick={() => setSelectedStorage('local')}
//             className="text-xs"
//           >
//             <HardDrive className="w-3 h-3 mr-1" />
//             Local
//           </Button>
//           <Button
//             variant={selectedStorage === 'cloud' ? 'default' : 'ghost'}
//             size="sm"
//             onClick={() => setSelectedStorage('cloud')}
//             className="text-xs"
//           >
//             <Cloud className="w-3 h-3 mr-1" />
//             Cloud
//           </Button>
//           <Button
//             variant={selectedStorage === 'external' ? 'default' : 'ghost'}
//             size="sm"
//             onClick={() => setSelectedStorage('external')}
//             className="text-xs"
//           >
//             <ExternalLink className="w-3 h-3 mr-1" />
//             External
//           </Button>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center gap-2 ml-auto">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowStorageSettings(!showStorageSettings)}
//             className="text-white/70 hover:text-white"
//           >
//             <Settings className="w-4 h-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowRecordings(!showRecordings)}
//             className="text-white/70 hover:text-white"
//           >
//             <Download className="w-4 h-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setShowNVR(!showNVR)}
//             className="text-white/70 hover:text-white"
//           >
//             <Camera className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Storage Settings Panel */}
//       {showStorageSettings && (
//         <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
//           <div className="flex justify-between items-center mb-3">
//             <h4 className="text-white font-medium">Storage Settings</h4>
//             <button 
//               onClick={() => setShowStorageSettings(false)}
//               className="text-white/50 hover:text-white"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//           <StorageSettings 
//             onClose={() => setShowStorageSettings(false)}
//             onStorageChange={setSelectedStorage}
//           />
//         </div>
//       )}

//       {/* Recordings List */}
//       {showRecordings && (
//         <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 max-h-[400px] overflow-y-auto">
//           <div className="flex justify-between items-center mb-3 sticky top-0 bg-slate-800/50 py-2">
//             <h4 className="text-white font-medium">Recordings</h4>
//             <button 
//               onClick={() => setShowRecordings(false)}
//               className="text-white/50 hover:text-white"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//           <RecordingList
//             childId={child?._id || child?.id}
//             onClose={() => setShowRecordings(false)}
//             onDownload={downloadRecording}
//           />
//         </div>
//       )}

//       {/* NVR Connection */}
//       {showNVR && (
//         <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
//           <div className="flex justify-between items-center mb-3">
//             <h4 className="text-white font-medium">NVR Connection</h4>
//             <button 
//               onClick={() => setShowNVR(false)}
//               className="text-white/50 hover:text-white"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//           <NVRConnection 
//             onClose={() => setShowNVR(false)}
//             onConnect={() => {}}
//           />
//         </div>
//       )}
//     </div>
//   );
// };



// frontend/src/components/Recording/RecordingControls.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Square, 
  Download, 
  Settings,
  Camera,
  HardDrive,
  Cloud,
  ExternalLink,
  X,
  Loader2
} from 'lucide-react';
import { useRecording } from '@/hooks/useRecording';
import { StorageSettings } from './StorageSettings';
import { RecordingList } from './RecordingList';
import { NVRConnection } from './NVRConnection';

export const RecordingControls = ({ child, onRecordingStart, onRecordingStop }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showStorageSettings, setShowStorageSettings] = useState(false);
  const [showRecordings, setShowRecordings] = useState(false);
  const [showNVR, setShowNVR] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState('local');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { startRecording, stopRecording, downloadRecording } = useRecording();

  const handleStartRecording = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await startRecording({
        childId: child?._id || child?.id,
        cameraId: child?.cameraId || child?._id,
        storageType: selectedStorage,
        format: 'mp4',
        resolution: '1080p'
      });
      console.log('Recording started:', result);
      setIsRecording(true);
      onRecordingStart?.();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError(error.message || 'Failed to start recording');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRecording = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await stopRecording();
      console.log('Recording stopped:', result);
      setIsRecording(false);
      onRecordingStop?.();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setError(error.message || 'Failed to stop recording');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700 min-w-[300px]">
      <div className="flex flex-wrap items-center gap-3">
        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className="min-w-[80px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isRecording ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Record
              </>
            )}
          </Button>

          {isRecording && (
            <div className="flex items-center gap-1 text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">REC</span>
            </div>
          )}
        </div>

        {/* Storage Selector */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
          <Button
            variant={selectedStorage === 'local' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedStorage('local')}
            className="text-xs"
            disabled={isRecording}
          >
            <HardDrive className="w-3 h-3 mr-1" />
            Local
          </Button>
          <Button
            variant={selectedStorage === 'cloud' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedStorage('cloud')}
            className="text-xs"
            disabled={isRecording}
          >
            <Cloud className="w-3 h-3 mr-1" />
            Cloud
          </Button>
          <Button
            variant={selectedStorage === 'external' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedStorage('external')}
            className="text-xs"
            disabled={isRecording}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            External
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStorageSettings(!showStorageSettings)}
            className="text-white/70 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRecordings(!showRecordings)}
            className="text-white/70 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNVR(!showNVR)}
            className="text-white/70 hover:text-white"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Storage Settings Panel */}
      {showStorageSettings && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-medium">Storage Settings</h4>
            <button 
              onClick={() => setShowStorageSettings(false)}
              className="text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <StorageSettings 
            onClose={() => setShowStorageSettings(false)}
            onStorageChange={setSelectedStorage}
          />
        </div>
      )}

      {/* Recordings List */}
      {showRecordings && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 max-h-[400px] overflow-y-auto">
          <div className="flex justify-between items-center mb-3 sticky top-0 bg-slate-800/50 py-2">
            <h4 className="text-white font-medium">Recordings</h4>
            <button 
              onClick={() => setShowRecordings(false)}
              className="text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <RecordingList
            childId={child?._id || child?.id}
            onClose={() => setShowRecordings(false)}
            onDownload={downloadRecording}
          />
        </div>
      )}

      {/* NVR Connection */}
      {showNVR && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-medium">NVR Connection</h4>
            <button 
              onClick={() => setShowNVR(false)}
              className="text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <NVRConnection 
            onClose={() => setShowNVR(false)}
            onConnect={() => {}}
          />
        </div>
      )}
    </div>
  );
};