// // frontend/src/components/CameraDashboard/CameraCard.jsx
// import React, { useState, useRef, useEffect } from "react";
// import {
//   VideoOff,
//   Power,
//   Play,
//   Square,
//   Eye,
//   Wifi,
//   WifiOff,
//   RefreshCw,
//   Maximize2,
//   Volume2,
//   VolumeX,
//   Camera as CameraIcon,
//   MoreVertical,
// } from "lucide-react";
// import { LiveFeedVideo } from "@/pages/parent-portal/LiveFeed/LiveFeedVideo";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export const CameraCard = ({
//   camera,
//   onView,
//   onActivate,
//   onStreamToggle,
//   isStreamActive = false,
// }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const [isMuted, setIsMuted] = useState(true);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(false);
//   const videoContainerRef = useRef(null);
//   const liveFeedRef = useRef(null);
//   const autoPlayTimerRef = useRef(null);

//   const isActive = camera.status === "active";
//   const isOnline = camera.streamStatus === "online";
//   const isStreaming = camera.isStreaming || isStreamActive;

//   // 🔥 FIXED: Auto-play only ONCE per camera
//   useEffect(() => {
//     // Clear any existing timer
//     if (autoPlayTimerRef.current) {
//       clearTimeout(autoPlayTimerRef.current);
//       autoPlayTimerRef.current = null;
//     }

//     // Only auto-play if:
//     // 1. Camera is active
//     // 2. Not already streaming
//     // 3. Not already auto-playing
//     // 4. Not already attempted
//     if (isActive && !isStreaming && !isAutoPlaying && !camera._autoPlayed) {
//       console.log(`🎯 Auto-playing camera: ${camera.name} (ID: ${camera._id})`);
//       onStreamToggle(camera);
//       // Mark as auto-played to prevent duplicates
//       camera._autoPlayed = true;
//       setIsAutoPlaying(true);

//       // Add delay to prevent all cameras starting at once
//       const delay = Math.random() * 1000 + 500; // 500-1500ms random delay

//       autoPlayTimerRef.current = setTimeout(() => {
//         onStreamToggle(camera);
//         // Reset auto-play flag after 5 seconds
//         setTimeout(() => {
//           setIsAutoPlaying(false);
//         }, 5000);
//       }, delay);
//     }

//     return () => {
//       if (autoPlayTimerRef.current) {
//         clearTimeout(autoPlayTimerRef.current);
//         autoPlayTimerRef.current = null;
//       }
//     };
//   }, [camera._id, isActive, isStreaming]);

//   // Get video element
//   const getVideoElement = () => {
//     if (liveFeedRef.current) {
//       if (liveFeedRef.current.videoElement) {
//         return liveFeedRef.current.videoElement;
//       }
//       const videoElement = videoContainerRef.current?.querySelector("video");
//       if (videoElement) {
//         return videoElement;
//       }
//     }
//     return null;
//   };

//   // Screenshot functionality
//   const handleScreenshot = () => {
//     const video = getVideoElement();
//     if (!video) {
//       console.log("Video not available");
//       return;
//     }

//     try {
//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth || 1280;
//       canvas.height = video.videoHeight || 720;
//       const ctx = canvas.getContext("2d");

//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//       ctx.fillStyle = "rgba(0,0,0,0.6)";
//       ctx.fillRect(10, canvas.height - 40, 250, 30);
//       ctx.fillStyle = "white";
//       ctx.font = "12px Arial";
//       ctx.fillText(
//         `📷 ${camera.name} • ${new Date().toLocaleString()}`,
//         20,
//         canvas.height - 18,
//       );

//       const screenshot = canvas.toDataURL("image/png");
//       const link = document.createElement("a");
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//       link.download = `screenshot-${camera.name}-${timestamp}.png`;
//       link.href = screenshot;
//       link.click();
//     } catch (error) {
//       console.error("Screenshot error:", error);
//     }
//   };

//   // Fullscreen functionality
//   const handleFullscreen = () => {
//     const video = getVideoElement();
//     if (!video) {
//       console.log("Video not available");
//       return;
//     }

//     try {
//       if (video.requestFullscreen) {
//         video.requestFullscreen();
//       } else if (video.webkitRequestFullscreen) {
//         video.webkitRequestFullscreen();
//       } else if (video.mozRequestFullScreen) {
//         video.mozRequestFullScreen();
//       } else if (video.msRequestFullscreen) {
//         video.msRequestFullscreen();
//       }
//     } catch (error) {
//       console.error("Fullscreen error:", error);
//     }
//   };

//   const getStatusBadge = () => {
//     if (isStreaming) {
//       return {
//         label: "LIVE",
//         color: "bg-red-500",
//         dotColor: "bg-white animate-pulse",
//         icon: <Wifi className="w-3 h-3 text-white" />,
//       };
//     } else if (isActive && isOnline) {
//       return {
//         label: "ONLINE",
//         color: "bg-green-500",
//         dotColor: "bg-white",
//         icon: <Wifi className="w-3 h-3 text-white" />,
//       };
//     } else if (isActive && !isOnline) {
//       return {
//         label: "OFFLINE",
//         color: "bg-yellow-500",
//         dotColor: "bg-white",
//         icon: <WifiOff className="w-3 h-3 text-white" />,
//       };
//     } else {
//       return {
//         label: "INACTIVE",
//         color: "bg-gray-500",
//         dotColor: "bg-white",
//         icon: <Power className="w-3 h-3 text-white" />,
//       };
//     }
//   };

//   const status = getStatusBadge();

//   return (
//     <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
//       {/* Video Preview */}
//       <div
//         ref={videoContainerRef}
//         className="relative aspect-video bg-black cursor-pointer"
//         onClick={() => onView(camera)}
//       >
//         {isActive ? (
//           <LiveFeedVideo
//             ref={liveFeedRef}
//             child={camera}
//             isPreview={true}
//             showControls={false}
//             className="rounded-none"
//             autoPlay={true}
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
//             <div className="text-center text-white/30">
//               <VideoOff size={48} className="mx-auto mb-3 opacity-30" />
//               <p className="text-sm font-medium">Camera Offline</p>
//             </div>
//           </div>
//         )}

//         {/* Status Badge */}
//         <div
//           className={`absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} backdrop-blur-sm shadow-lg`}
//         >
//           <span className={`w-2 h-2 rounded-full ${status.dotColor}`}></span>
//           <span className="text-white text-xs font-bold tracking-wider uppercase">
//             {status.label}
//           </span>
//         </div>

//         {/* Camera Name */}
//         <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
//           <p className="text-white text-sm font-medium">{camera.name}</p>
//         </div>

//         {/* Live Time */}
//         {isStreaming && (
//           <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
//             <span className="text-white/80 text-[10px] font-mono">
//               🟢 {new Date().toLocaleTimeString()}
//             </span>
//           </div>
//         )}

//         {/* Hover Overlay */}
//         <div
//           className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
//             isHovered ? "opacity-100" : "opacity-0"
//           }`}
//         >
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onView(camera);
//             }}
//             className="px-6 py-3 bg-white/90 hover:bg-white text-slate-800 rounded-xl font-medium transition shadow-lg flex items-center gap-2"
//           >
//             <Eye className="w-5 h-5" />
//             View Stream
//           </button>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="p-4 bg-white border-t border-slate-100">
//         <div className="flex items-center justify-between">
//           {/* Left - Camera Info */}
//           <div className="flex items-center gap-3">
//             <div
//               className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-300"}`}
//             ></div>
//             <div>
//               <p className="text-sm font-semibold text-slate-800">
//                 {camera.name}
//               </p>
//               <p className="text-xs text-slate-400">
//                 {camera.class || "Camera"}
//               </p>
//             </div>
//           </div>

//           {/* Right - Controls */}
//           <div className="flex items-center gap-1">
//             {/* Start/Stop Stream */}
//             <Button
//               onClick={() => {
//                 // Reset auto-play flag on manual toggle
//                 camera._autoPlayed = false;
//                 onStreamToggle(camera);
//               }}
//               variant={isStreaming ? "destructive" : "default"}
//               size="sm"
//               className={`rounded-xl transition-all duration-200 ${
//                 isStreaming
//                   ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
//                   : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
//               } shadow-lg`}
//             >
//               {isStreaming ? (
//                 <>
//                   <Square className="w-3.5 h-3.5 mr-1.5" />
//                   Stop
//                 </>
//               ) : (
//                 <>
//                   <Play className="w-3.5 h-3.5 mr-1.5" />
//                   Start
//                 </>
//               )}
//             </Button>

//             {/* Power Toggle */}
//             <Button
//               onClick={() => {
//                 camera._autoPlayed = false;
//                 onActivate(camera._id);
//               }}
//               variant={isActive ? "outline" : "default"}
//               size="icon"
//               className={`rounded-xl ${isActive ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30 shadow-lg"}`}
//             >
//               <Power className="w-4 h-4" />
//             </Button>

//             {/* Fullscreen Button */}
//             <Button
//               onClick={handleFullscreen}
//               variant="outline"
//               size="icon"
//               className="rounded-xl hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
//             >
//               <Maximize2 className="w-4 h-4" />
//             </Button>

//             {/* More Options */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="rounded-xl">
//                   <MoreVertical className="w-4 h-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-52 rounded-xl">
//                 <DropdownMenuItem onClick={handleScreenshot}>
//                   <CameraIcon className="w-4 h-4 mr-2" />
//                   Take Screenshot
//                 </DropdownMenuItem>

//                 <DropdownMenuItem onClick={handleFullscreen}>
//                   <Maximize2 className="w-4 h-4 mr-2" />
//                   Fullscreen
//                 </DropdownMenuItem>

//                 <DropdownMenuItem onClick={() => setIsMuted(!isMuted)}>
//                   {isMuted ? (
//                     <VolumeX className="w-4 h-4 mr-2" />
//                   ) : (
//                     <Volume2 className="w-4 h-4 mr-2" />
//                   )}
//                   {isMuted ? "Unmute" : "Mute"}
//                 </DropdownMenuItem>

//                 <DropdownMenuItem onClick={() => window.location.reload()}>
//                   <RefreshCw className="w-4 h-4 mr-2" />
//                   Refresh Stream
//                 </DropdownMenuItem>

//                 {camera.ipAddress && (
//                   <DropdownMenuItem className="text-slate-400 text-xs border-t mt-1 pt-1">
//                     IP: {camera.ipAddress}
//                   </DropdownMenuItem>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };








// frontend/src/components/CameraDashboard/CameraCard.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  VideoOff,
  Power,
  Play,
  Square,
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  Maximize2,
  Volume2,
  VolumeX,
  Camera as CameraIcon,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { LiveFeedVideo } from "@/pages/parent-portal/LiveFeed/LiveFeedVideo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CameraCard = ({
  camera,
  onView,
  onActivate,
  onStreamToggle,
  isStreamActive = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoContainerRef = useRef(null);
  const liveFeedRef = useRef(null);

  const isActive = camera.status === "active";
  const isOnline = camera.streamStatus === "online";
  const isStreaming = camera.isStreaming || isStreamActive;
  const isStarting = camera.isStarting && !isStreaming; // ✅ backend hint

  // ✅ NO auto onStreamToggle — backend already starts stream.
  //    Just mark for potential future use.
  useEffect(() => {
    // Intentionally empty — rely on backend auto-start
  }, [camera._id]);

  const getVideoElement = () => {
    if (liveFeedRef.current) {
      if (liveFeedRef.current.videoElement) {
        return liveFeedRef.current.videoElement;
      }
      return videoContainerRef.current?.querySelector("video") || null;
    }
    return null;
  };

  const handleScreenshot = () => {
    const video = getVideoElement();
    if (!video) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(10, canvas.height - 40, 250, 30);
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(
        `📷 ${camera.name} • ${new Date().toLocaleString()}`,
        20,
        canvas.height - 18,
      );
      const screenshot = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `screenshot-${camera.name}-${timestamp}.png`;
      link.href = screenshot;
      link.click();
    } catch (error) {
      console.error("Screenshot error:", error);
    }
  };

  const handleFullscreen = () => {
    const video = getVideoElement();
    if (!video) return;
    try {
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
      else if (video.mozRequestFullScreen) video.mozRequestFullScreen();
      else if (video.msRequestFullscreen) video.msRequestFullscreen();
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const getStatusBadge = () => {
    if (isStreaming) {
      return {
        label: "LIVE",
        color: "bg-red-500",
        dotColor: "bg-white animate-pulse",
      };
    }
    if (isStarting) {
      return {
        label: "STARTING",
        color: "bg-blue-500",
        dotColor: "bg-white animate-pulse",
      };
    }
    if (isActive && isOnline) {
      return { label: "ONLINE", color: "bg-green-500", dotColor: "bg-white" };
    }
    if (isActive && !isOnline) {
      return { label: "OFFLINE", color: "bg-yellow-500", dotColor: "bg-white" };
    }
    return { label: "INACTIVE", color: "bg-gray-500", dotColor: "bg-white" };
  };

  const status = getStatusBadge();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
      {/* Video Preview */}
      <div
        ref={videoContainerRef}
        className="relative aspect-video bg-black cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView(camera)}
      >
        {isActive ? (
          <LiveFeedVideo
            ref={liveFeedRef}
            child={camera}
            isPreview={true}
            showControls={false}
            className="rounded-none"
            autoPlay={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center text-white/30">
              <VideoOff size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Camera Offline</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} backdrop-blur-sm shadow-lg`}
        >
          <span className={`w-2 h-2 rounded-full ${status.dotColor}`}></span>
          <span className="text-white text-xs font-bold tracking-wider uppercase">
            {status.label}
          </span>
        </div>

        {/* Camera Name */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <p className="text-white text-sm font-medium">{camera.name}</p>
        </div>

        {/* Live Time */}
        {isStreaming && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <span className="text-white/80 text-[10px] font-mono">
              🟢 {new Date().toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Starting overlay */}
        {isStarting && (
          <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/90 backdrop-blur-sm shadow-lg">
            <Loader2 className="w-3 h-3 text-white animate-spin" />
            <span className="text-white text-xs font-bold tracking-wider uppercase">
              Starting
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(camera);
            }}
            className="px-6 py-3 bg-white/90 hover:bg-white text-slate-800 rounded-xl font-medium transition shadow-lg flex items-center gap-2"
          >
            <Eye className="w-5 h-5" />
            View Stream
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-300"}`}
            ></div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {camera.name}
              </p>
              <p className="text-xs text-slate-400">
                {camera.class || "Camera"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* ✅ Manual Start/Stop — real user action */}
            <Button
              onClick={() => onStreamToggle(camera)}
              variant={isStreaming ? "destructive" : "default"}
              size="sm"
              disabled={!isActive}
              className={`rounded-xl transition-all duration-200 ${
                isStreaming
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                  : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"
              } shadow-lg disabled:opacity-50`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-3.5 h-3.5 mr-1.5" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Start
                </>
              )}
            </Button>

            <Button
              onClick={() => onActivate(camera._id)}
              variant={isActive ? "outline" : "default"}
              size="icon"
              className={`rounded-xl ${
                isActive
                  ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30 shadow-lg"
              }`}
            >
              <Power className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleFullscreen}
              variant="outline"
              size="icon"
              className="rounded-xl hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <DropdownMenuItem onClick={handleScreenshot}>
                  <CameraIcon className="w-4 h-4 mr-2" />
                  Take Screenshot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFullscreen}>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Fullscreen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 mr-2" />
                  ) : (
                    <Volume2 className="w-4 h-4 mr-2" />
                  )}
                  {isMuted ? "Unmute" : "Mute"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Stream
                </DropdownMenuItem>
                {camera.ipAddress && (
                  <DropdownMenuItem className="text-slate-400 text-xs border-t mt-1 pt-1">
                    IP: {camera.ipAddress}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};