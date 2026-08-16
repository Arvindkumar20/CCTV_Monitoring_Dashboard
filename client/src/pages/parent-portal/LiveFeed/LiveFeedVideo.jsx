// import React, { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";
// import { LiveFeedControls } from "./LiveFeedControls";

// export const LiveFeedVideo = ({ child }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const videoRef = useRef(null);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (!child?.hasCamera || !child?.hlsUrl) return;

//     let hls = null;

//     const initPlayer = () => {
//       if (Hls.isSupported()) {
//         hls = new Hls({
//           maxBufferLength: 10,
//           maxMaxBufferLength: 30,
//           enableWorker: true
//         });

//         hls.loadSource(child.hlsUrl);
//         hls.attachMedia(videoRef.current);

//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           setLoading(false);
//           videoRef.current.play().catch(console.error);
//         });

//         hls.on(Hls.Events.ERROR, (event, data) => {
//           console.error("HLS error:", data);
//           setError("Stream error occurred");
//           setLoading(false);
//         });
//       } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
//         // Native HLS support (Safari)
//         videoRef.current.src = child.hlsUrl;
//         videoRef.current.addEventListener("loadedmetadata", () => {
//           setLoading(false);
//           videoRef.current.play().catch(console.error);
//         });
//       }
//     };

//     initPlayer();

//     return () => {
//       if (hls) {
//         hls.destroy();
//       }
//     };
//   }, [child]);

//   const handleFullscreen = () => {
//     if (containerRef.current) {
//       if (!isFullscreen) {
//         containerRef.current.requestFullscreen();
//         setIsFullscreen(true);
//       } else {
//         document.exitFullscreen();
//         setIsFullscreen(false);
//       }
//     }
//   };

//   const handleScreenshot = () => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

//       const link = document.createElement("a");
//       link.download = `screenshot-${child.name}-${Date.now()}.png`;
//       link.href = canvas.toDataURL("image/png");
//       link.click();
//     }
//   };

//   const handleRefresh = () => {
//     window.location.reload();
//   };

//   return (
//     <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group border border-slate-300">
//       {/* Live Indicator */}
//       <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
//         <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
//         <span className="text-white text-xs font-bold tracking-wide uppercase">Live</span>
//       </div>

//       {/* Camera Name */}
//       <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white/90 text-xs font-medium">
//         {child.name} • {child.class}
//       </div>

//       {/* Video Player */}
//       {child.hasCamera ? (
//         <>
//           <video
//             ref={videoRef}
//             className="w-full h-full"
//             playsInline
//             muted={false}
//           />

//           {loading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
//               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           )}

//           {error && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white">
//               <div className="text-center">
//                 <p className="text-red-500 font-bold mb-2">Stream Error</p>
//                 <p className="text-sm">{error}</p>
//               </div>
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-slate-900">
//           <div className="text-center text-white/50">
//             <div className="text-4xl mb-2">📹</div>
//             <p>Camera is offline</p>
//           </div>
//         </div>
//       )}

//       {/* Controls */}
//       <LiveFeedControls
//         onScreenshot={handleScreenshot}
//         onRefresh={handleRefresh}
//         onFullscreen={handleFullscreen}
//       />
//     </div>
//   );
// };

// // components/LiveFeedVideo.jsx
// import React, { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";

// import { Badge } from "@/components/ui/badge";
// import { LiveFeedControls } from "./LiveFeedControls";
// import { RecordingControls } from "@/components/RecordingControls";

// export const LiveFeedVideo = ({ child }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const videoRef = useRef(null);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (!child?.hasCamera || !child?.hlsUrl) return;

//     let hls = null;

//     const initPlayer = () => {
//       if (Hls.isSupported()) {
//         hls = new Hls({
//           maxBufferLength: 10,
//           maxMaxBufferLength: 30,
//           enableWorker: true
//         });

//         hls.loadSource(child.hlsUrl);
//         hls.attachMedia(videoRef.current);

//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           setLoading(false);
//           videoRef.current.play().catch(console.error);
//         });

//         hls.on(Hls.Events.ERROR, (event, data) => {
//           console.error("HLS error:", data);
//           setError("Stream error occurred");
//           setLoading(false);
//         });
//       } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
//         // Native HLS support (Safari)
//         videoRef.current.src = child.hlsUrl;
//         videoRef.current.addEventListener("loadedmetadata", () => {
//           setLoading(false);
//           videoRef.current.play().catch(console.error);
//         });
//       }
//     };

//     initPlayer();

//     return () => {
//       if (hls) {
//         hls.destroy();
//       }
//     };
//   }, [child]);

//   const handleFullscreen = () => {
//     if (containerRef.current) {
//       if (!isFullscreen) {
//         containerRef.current.requestFullscreen();
//         setIsFullscreen(true);
//       } else {
//         document.exitFullscreen();
//         setIsFullscreen(false);
//       }
//     }
//   };

//   const handleScreenshot = () => {
//     if (videoRef.current) {
//       const canvas = document.createElement("canvas");
//       canvas.width = videoRef.current.videoWidth;
//       canvas.height = videoRef.current.videoHeight;
//       canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

//       const link = document.createElement("a");
//       link.download = `screenshot-${child.name}-${Date.now()}.png`;
//       link.href = canvas.toDataURL("image/png");
//       link.click();
//     }
//   };

//   const handleRefresh = () => {
//     window.location.reload();
//   };

//   return (
//     <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group border border-slate-300">
//       {/* Live Indicator */}
//       <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
//         <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
//         <span className="text-white text-xs font-bold tracking-wide uppercase">Live</span>
//         {isRecording && (
//           <Badge className="ml-1 bg-red-500 text-white text-[8px] px-1 py-0 animate-pulse">
//             REC
//           </Badge>
//         )}
//       </div>

//       {/* Camera Name */}
//       <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white/90 text-xs font-medium">
//         {child.name} • {child.class}
//       </div>

//       {/* Video Player */}
//       {child.hasCamera ? (
//         <>
//           <video
//             ref={videoRef}
//             className="w-full h-full"
//             playsInline
//             muted={false}
//           />

//           {loading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
//               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           )}

//           {error && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white">
//               <div className="text-center">
//                 <p className="text-red-500 font-bold mb-2">Stream Error</p>
//                 <p className="text-sm">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Recording Controls */}
//           <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//             <RecordingControls
//               videoRef={videoRef}
//               cameraName={child.name}
//             />
//           </div>
//         </>
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-slate-900">
//           <div className="text-center text-white/50">
//             <div className="text-4xl mb-2">📹</div>
//             <p>Camera is offline</p>
//           </div>
//         </div>
//       )}

//       {/* Controls */}
//       <LiveFeedControls
//         onScreenshot={handleScreenshot}
//         onRefresh={handleRefresh}
//         onFullscreen={handleFullscreen}
//       />
//     </div>
//   );
// };

// // frontend/src/components/LiveFeed/LiveFeedVideo.jsx
// import React, { useRef, useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";
// import { RecordingControls } from "@/components/Recording/RecordingControls";
// import { LiveFeedControls } from "./LiveFeedControls";
// import Hls from "hls.js";

// export const LiveFeedVideo = ({ child }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [liveURL, setLiveURL] = useState(child?.hlsUrl);
//   const [isMuted, setIsMuted] = useState(false);
//   const [showStartButton, setShowStartButton] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isBuffering, setIsBuffering] = useState(false);
//   const [error, setError] = useState(null);
//   const containerRef = useRef(null);
//   const videoRef = useRef(null);
//   const hlsRef = useRef(null);

//   // Debug logging
//   useEffect(() => {
//     setLiveURL(child?.hasCamera);
//     console.log("🔍 LiveFeedVideo - Child Data:", {
//       name: child?.name,
//       id: child?._id,
//       hasCamera: child?.hasCamera,
//       hlsUrl: child?.hlsUrl,
//       isStreaming: child?.isStreaming,
//       streamStatus: child?.streamStatus,
//       status: child?.status,
//       isValid: !!(child?._id && child?.status === "active"),
//     });
//   }, [child]);

//   // Initialize HLS Player
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     // Check if camera is valid
//     const isValidCamera = child?._id && child?.status === "active";
//     const hasStreamUrl = !!child?.hlsUrl;

//     if (!isValidCamera || !hasStreamUrl) {
//       setIsLoading(false);
//       return;
//     }

//     // Clean up previous HLS instance
//     if (hlsRef.current) {
//       hlsRef.current.destroy();
//       hlsRef.current = null;
//     }

//     // Build full URL
//     const fullUrl = `http://localhost:5000${liveURL}`;
//     console.log("📹 Initializing HLS with URL:", fullUrl);

//     // Check if HLS.js is supported
//     if (Hls.isSupported()) {
//       const hls = new Hls({
//         enableWorker: true,
//         lowLatencyMode: true,
//         backbufferLength: 30,
//         maxBufferLength: 30,
//         maxMaxBufferLength: 600,
//         startLevel: -1, // Auto quality
//         debug: false,
//       });

//       hlsRef.current = hls;

//       // Load the stream
//       hls.loadSource(fullUrl);
//       hls.attachMedia(video);

//       // Event handlers
//       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
//         console.log("✅ HLS Media attached");
//         setIsLoading(false);
//         setError(null);
//       });

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         console.log("✅ HLS Manifest parsed, attempting to play");
//         setIsLoading(false);
//         setError(null);
//         video.play().catch((err) => {
//           console.warn("⚠️ Autoplay prevented:", err);
//         });
//       });

//       hls.on(Hls.Events.FRAG_CHANGED, () => {
//         setIsBuffering(false);
//       });

//       hls.on(Hls.Events.FRAG_LOADING, () => {
//         setIsBuffering(true);
//       });

//       hls.on(Hls.Events.FRAG_LOADED, () => {
//         setIsBuffering(false);
//       });

//       hls.on(Hls.Events.LEVEL_SWITCHING, () => {
//         setIsBuffering(true);
//       });

//       hls.on(Hls.Events.LEVEL_SWITCHED, () => {
//         setIsBuffering(false);
//       });

//       hls.on(Hls.Events.ERROR, (event, data) => {
//         console.error("❌ HLS Error:", data);

//         if (data.fatal) {
//           switch (data.type) {
//             case Hls.ErrorTypes.NETWORK_ERROR:
//               console.warn("⚠️ Network error, trying to recover...");
//               hls.startLoad();
//               break;
//             case Hls.ErrorTypes.MEDIA_ERROR:
//               console.warn("⚠️ Media error, trying to recover...");
//               hls.recoverMediaError();
//               break;
//             default:
//               console.error("❌ Fatal error:", data);
//               setError("Failed to load stream. Please try again.");
//               setIsLoading(false);
//               break;
//           }
//         } else {
//           setError("Stream error occurred");
//           setIsLoading(false);
//         }
//       });

//       // Video event handlers
//       video.addEventListener("playing", () => {
//         console.log("▶️ Video playing");
//         setIsPlaying(true);
//         setIsLoading(false);
//         setError(null);
//       });

//       video.addEventListener("pause", () => {
//         console.log("⏸️ Video paused");
//         setIsPlaying(false);
//       });

//       video.addEventListener("waiting", () => {
//         console.log("⏳ Video waiting/buffering");
//         setIsBuffering(true);
//       });

//       video.addEventListener("canplay", () => {
//         console.log("✅ Video can play");
//         setIsLoading(false);
//         setError(null);
//       });

//       video.addEventListener("error", (e) => {
//         console.error("❌ Video element error:", e);
//         const errorMessage = video.error?.message || "Video playback error";
//         setError(errorMessage);
//         setIsLoading(false);
//       });

//       // Cleanup
//       return () => {
//         console.log("🧹 Cleaning up HLS player");
//         if (hlsRef.current) {
//           hlsRef.current.destroy();
//           hlsRef.current = null;
//         }
//         // Remove event listeners
//         video.removeEventListener("playing", () => {});
//         video.removeEventListener("pause", () => {});
//         video.removeEventListener("waiting", () => {});
//         video.removeEventListener("canplay", () => {});
//         video.removeEventListener("error", () => {});
//       };
//     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       // For Safari native HLS support
//       console.log("📱 Using native HLS (Safari)");
//       video.src = fullUrl;
//       video.addEventListener("loadedmetadata", () => {
//         console.log("✅ Native HLS loaded");
//         setIsLoading(false);
//         video.play().catch((err) => {
//           console.warn("⚠️ Autoplay prevented:", err);
//         });
//       });
//     } else {
//       console.error("❌ HLS not supported in this browser");
//       setError("HLS streaming not supported in this browser");
//       setIsLoading(false);
//     }

//     // Cleanup function
//     return () => {
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//       if (video) {
//         video.src = "";
//         video.load();
//       }
//     };
//   }, [child?._id, child?.status, child?.hlsUrl]);

//   // Check if stream needs to be started
//   useEffect(() => {
//     const isValidCamera = child?._id && child?.status === "active";
//     const hasStream = !!child?.hlsUrl;

//     if (isValidCamera && !hasStream && !isLoading) {
//       setShowStartButton(true);
//     } else {
//       setShowStartButton(false);
//     }
//   }, [child?._id, child?.status, child?.hlsUrl, isLoading]);

//   // Handle fullscreen
//   const handleFullscreen = () => {
//     if (containerRef.current) {
//       if (!isFullscreen) {
//         containerRef.current.requestFullscreen().catch(console.error);
//         setIsFullscreen(true);
//       } else {
//         document.exitFullscreen().catch(console.error);
//         setIsFullscreen(false);
//       }
//     }
//   };

//   // Handle screenshot
//   const handleScreenshot = () => {
//     const video = videoRef.current;
//     if (!video) return;

//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const screenshot = canvas.toDataURL("image/png");
//     if (screenshot) {
//       const link = document.createElement("a");
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//       link.download = `screenshot-${child?.name || "camera"}-${timestamp}.png`;
//       link.href = screenshot;
//       link.click();
//     }
//   };

//   // Handle refresh
//   const handleRefresh = () => {
//     console.log("🔄 Refreshing stream...");
//     setError(null);
//     setIsLoading(true);
//     setIsBuffering(false);

//     if (hlsRef.current) {
//       hlsRef.current.loadSource(`http://localhost:5000${liveURL}`);
//     } else if (videoRef.current) {
//       videoRef.current.load();
//       videoRef.current.play().catch(console.warn);
//     }
//   };

//   // Handle retry
//   const handleRetry = () => {
//     console.log("🔄 Retrying connection...");
//     setError(null);
//     setIsLoading(true);
//     handleRefresh();
//   };

//   // Handle start stream
//   const handleStartStream = () => {
//     console.log("▶️ Starting stream for camera:", child?._id);
//     if (window.startCameraStream) {
//       window.startCameraStream(child?._id);
//     } else {
//       console.warn("⚠️ startCameraStream function not available");
//     }
//   };

//   // Listen for stream start events
//   useEffect(() => {
//     const handleStreamStarted = (event) => {
//       console.log("📡 Stream started event received:", event.detail);
//       if (event.detail.cameraId === child?._id) {
//         setShowStartButton(false);
//         setIsLoading(true);
//         setTimeout(() => handleRefresh(), 1000);
//       }
//     };

//     window.addEventListener("streamStarted", handleStreamStarted);
//     return () => {
//       window.removeEventListener("streamStarted", handleStreamStarted);
//     };
//   }, [child?._id]);

//   // Toggle mute
//   const toggleMute = () => {
//     const video = videoRef.current;
//     if (video) {
//       video.muted = !video.muted;
//       setIsMuted(video.muted);
//     }
//   };

//   // Check if camera is viewable
//   const isValidCamera = child?._id && child?.status === "active";
//   const hasStreamUrl = !!child?.hlsUrl;

//   return (
//     <div
//       ref={containerRef}
//       className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group border border-slate-300"
//     >
//       {/* Live Indicator */}
//       <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
//         <span
//           className={`w-2.5 h-2.5 rounded-full animate-pulse ${
//             isPlaying && hasStreamUrl
//               ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
//               : isLoading
//                 ? "bg-yellow-500"
//                 : "bg-gray-500"
//           }`}
//         ></span>
//         <span className="text-white text-xs font-bold tracking-wide uppercase">
//           {isPlaying && hasStreamUrl
//             ? "Live"
//             : isLoading
//               ? "Connecting..."
//               : hasStreamUrl
//                 ? "Disconnected"
//                 : isValidCamera
//                   ? "Stopped"
//                   : "Offline"}
//         </span>
//         {isRecording && (
//           <Badge className="ml-1 bg-red-500 text-white text-[8px] px-1 py-0 animate-pulse">
//             REC
//           </Badge>
//         )}
//         {isBuffering && !isLoading && (
//           <Badge className="ml-1 bg-yellow-500 text-white text-[8px] px-1 py-0 animate-pulse">
//             BUFFERING
//           </Badge>
//         )}
//       </div>

//       {/* Camera Name */}
//       <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white/90 text-xs font-medium">
//         {child?.name || "Camera"} {child?.class && `• ${child.class}`}
//       </div>

//       {/* Stream Status - Debug Info */}
//       <div className="absolute top-16 right-4 z-10 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-white/50 text-[8px] font-mono">
//         ID: {child?._id?.slice(-6) || "N/A"}
//         {child?.status === "active" ? " ✅" : " ❌"}
//         {child?.hlsUrl ? " 📡" : " ⏹️"}
//       </div>

//       {/* Video Player */}
//       {isValidCamera ? (
//         <>
//           <video
//             ref={videoRef}
//             className="w-full h-full object-contain"
//             playsInline
//             muted={isMuted}
//             autoPlay
//             // src={`http://localhost:5000${liveURL}`}
//           />

//           {/* Start Stream Button - Shown when no hlsUrl */}
//           {showStartButton && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/90">
//               <div className="text-center max-w-sm p-6 bg-white/5 rounded-xl border border-white/10">
//                 <div className="text-4xl mb-3">📹</div>
//                 <p className="text-white font-bold mb-2">Stream Not Started</p>
//                 <p className="text-white/70 text-sm mb-4">
//                   Click below to start the live stream
//                 </p>
//                 <button
//                   onClick={handleStartStream}
//                   className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
//                 >
//                   <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
//                   Start Live Stream
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Loading Overlay */}
//           {isLoading && !showStartButton && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/80">
//               <div className="flex flex-col items-center gap-3">
//                 <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                 <span className="text-white/70 text-sm font-medium">
//                   Loading stream...
//                 </span>
//                 <span className="text-white/40 text-xs">
//                   {child?.hlsUrl
//                     ? "Connecting to stream..."
//                     : "Waiting for stream..."}
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Error Overlay */}
//           {error && !showStartButton && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/90">
//               <div className="text-center max-w-sm p-6 bg-white/5 rounded-xl border border-red-500/20">
//                 <div className="text-4xl mb-3">⚠️</div>
//                 <p className="text-red-500 font-bold mb-2">Stream Error</p>
//                 <p className="text-white/70 text-sm mb-4">{error}</p>
//                 <button
//                   onClick={handleRetry}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
//                 >
//                   Retry Connection
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Recording Controls */}
//           <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//             <RecordingControls
//               child={child}
//               onRecordingStart={() => setIsRecording(true)}
//               onRecordingStop={() => setIsRecording(false)}
//             />
//           </div>

//           {/* Stream Info */}
//           <div className="absolute bottom-4 left-4 z-10 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-white/60 text-[10px] font-mono">
//             {isPlaying && hasStreamUrl
//               ? "🟢 Streaming"
//               : hasStreamUrl
//                 ? "🔴 Disconnected"
//                 : "⏸️ Stopped"}
//             {hasStreamUrl && (
//               <span className="ml-2">• {new Date().toLocaleTimeString()}</span>
//             )}
//             {child?.resolution && (
//               <span className="ml-2">• {child.resolution}</span>
//             )}
//           </div>
//         </>
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-slate-900">
//           <div className="text-center text-white/50">
//             <div className="text-4xl mb-2">📹</div>
//             <p className="font-medium">
//               Camera is {child?.status || "offline"}
//             </p>
//             <p className="text-xs mt-1">
//               {!child?._id ? "No camera data" : "Camera not active"}
//             </p>
//             {child?.status && (
//               <p className="text-xs mt-2 text-white/30">
//                 Status: {child.status}
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       <video>
//         <source src={`http://localhost:5000${liveURL}`} />
//       </video>

//       {/* Controls */}
//       <LiveFeedControls
//         onScreenshot={handleScreenshot}
//         onRefresh={handleRefresh}
//         onFullscreen={handleFullscreen}
//         isPlaying={isPlaying}
//         buffering={isBuffering}
//         isFullscreen={isFullscreen}
//         onToggleMute={toggleMute}
//         isMuted={isMuted}
//         hasStream={hasStreamUrl}
//         onStartStream={handleStartStream}
//         showStartButton={showStartButton}
//         isValidCamera={isValidCamera}
//       /> 
//     </div>
//   );
// };





// // frontend/src/components/LiveFeed/LiveFeedVideo.jsx
// import React, { useRef, useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";

// import Hls from "hls.js";
// import { StreamQualityIndicator } from "./StreamQualityIndicator";
// import { VideoStatusOverlay } from "./VideoStatusOverlay";
// import { RecordingControls } from "@/components/RecordingControls";

// export const LiveFeedVideo = ({ 
//   child, 
//   isPreview = false,
//   onStreamStart,
//   onStreamStop,
//   showControls = true,
//   className = "",
//   aspectRatio = "video"
// }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [liveURL, setLiveURL] = useState(child?.hlsUrl);
//   const [isMuted, setIsMuted] = useState(true);
//   const [showStartButton, setShowStartButton] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isBuffering, setIsBuffering] = useState(false);
//   const [error, setError] = useState(null);
//   const [connectionAttempts, setConnectionAttempts] = useState(0);
//   const [videoQuality, setVideoQuality] = useState('auto');
//   const [bitrate, setBitrate] = useState(0);
//   const [latency, setLatency] = useState(0);
//   const containerRef = useRef(null);
//   const videoRef = useRef(null);
//   const hlsRef = useRef(null);
//   const reconnectTimerRef = useRef(null);

//   // Debug logging
//   useEffect(() => {
//     console.log("🔍 LiveFeedVideo - Child Data:", {
//       name: child?.name,
//       id: child?._id,
//       hasCamera: child?.hasCamera,
//       hlsUrl: child?.hlsUrl,
//       isStreaming: child?.isStreaming,
//       streamStatus: child?.streamStatus,
//       status: child?.status,
//     });
//   }, [child]);

//   // Initialize HLS Player
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const isValidCamera = child?._id && child?.status === "active";
//     const hasStreamUrl = !!child?.hlsUrl;

//     if (!isValidCamera || !hasStreamUrl) {
//       setIsLoading(false);
//       if (!isValidCamera) {
//         setError("Camera is not active");
//       }
//       return;
//     }

//     // Clean up previous HLS instance
//     if (hlsRef.current) {
//       hlsRef.current.destroy();
//       hlsRef.current = null;
//     }

//     // Clear any reconnect timer
//     if (reconnectTimerRef.current) {
//       clearTimeout(reconnectTimerRef.current);
//       reconnectTimerRef.current = null;
//     }

//     const fullUrl = child?.hlsUrl?.startsWith('http') 
//       ? child.hlsUrl 
//       : `http://localhost:5000${child?.hlsUrl || ''}`;
    
//     console.log("📹 Initializing HLS with URL:", fullUrl);

//     if (Hls.isSupported()) {
//       const hls = new Hls({
//         enableWorker: true,
//         lowLatencyMode: true,
//         backbufferLength: 30,
//         maxBufferLength: 30,
//         maxMaxBufferLength: 600,
//         startLevel: -1,
//         debug: false,
//         // Additional HLS configs for better performance
//         fragLoadingTimeOut: 20000,
//         manifestLoadingTimeOut: 10000,
//         levelLoadingTimeOut: 10000,
//       });

//       hlsRef.current = hls;
//       hls.loadSource(fullUrl);
//       hls.attachMedia(video);

//       // Event handlers
//       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
//         console.log("✅ HLS Media attached");
//         setIsLoading(false);
//         setError(null);
//         setConnectionAttempts(0);
//       });

//       hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
//         console.log("✅ HLS Manifest parsed, levels:", data.levels.length);
//         setIsLoading(false);
//         setError(null);
        
//         // Auto play with user interaction handling
//         video.play().catch((err) => {
//           console.warn("⚠️ Autoplay prevented:", err);
//           if (err.name === 'NotAllowedError') {
//             // Show play button overlay
//             setError("Click to play video");
//           }
//         });
//       });

//       hls.on(Hls.Events.FRAG_CHANGED, () => {
//         setIsBuffering(false);
//       });

//       hls.on(Hls.Events.FRAG_LOADING, () => {
//         setIsBuffering(true);
//       });

//       hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
//         setIsBuffering(false);
//         // Calculate bitrate
//         if (data.frag.stats && data.frag.stats.totalduration) {
//           const bitrate = (data.frag.stats.totalbytes * 8) / data.frag.stats.totalduration / 1000;
//           setBitrate(Math.round(bitrate));
//         }
//       });

//       hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
//         setVideoQuality(`Level ${data.level}`);
//         setIsBuffering(false);
//       });

//       hls.on(Hls.Events.ERROR, (event, data) => {
//         console.error("❌ HLS Error:", data);

//         if (data.fatal) {
//           switch (data.type) {
//             case Hls.ErrorTypes.NETWORK_ERROR:
//               console.warn("⚠️ Network error, retrying...");
//               if (connectionAttempts < 3) {
//                 setConnectionAttempts(prev => prev + 1);
//                 setTimeout(() => {
//                   if (hlsRef.current) {
//                     hlsRef.current.startLoad();
//                   }
//                 }, 2000);
//               } else {
//                 setError("Network error. Please refresh.");
//                 setIsLoading(false);
//               }
//               break;
//             case Hls.ErrorTypes.MEDIA_ERROR:
//               console.warn("⚠️ Media error, trying to recover...");
//               hls.recoverMediaError();
//               break;
//             default:
//               console.error("❌ Fatal error:", data);
//               setError("Failed to load stream. Please try again.");
//               setIsLoading(false);
//               break;
//           }
//         } else {
//           if (data.details === 'manifestLoadError') {
//             setError("Stream not available");
//             setIsLoading(false);
//           }
//         }
//       });

//       // Video event handlers
//       video.addEventListener("playing", () => {
//         console.log("▶️ Video playing");
//         setIsPlaying(true);
//         setIsLoading(false);
//         setError(null);
//         setConnectionAttempts(0);
//       });

//       video.addEventListener("pause", () => {
//         console.log("⏸️ Video paused");
//         setIsPlaying(false);
//       });

//       video.addEventListener("waiting", () => {
//         console.log("⏳ Video waiting/buffering");
//         setIsBuffering(true);
//       });

//       video.addEventListener("canplay", () => {
//         console.log("✅ Video can play");
//         setIsLoading(false);
//         setError(null);
//       });

//       video.addEventListener("error", (e) => {
//         console.error("❌ Video element error:", e);
//         const errorMessage = video.error?.message || "Video playback error";
//         setError(errorMessage);
//         setIsLoading(false);
//       });

//       // Calculate latency
//       const latencyInterval = setInterval(() => {
//         if (video.currentTime > 0) {
//           const currentLatency = video.currentTime - (hlsRef.current?.liveSyncPosition || 0);
//           setLatency(Math.round(Math.abs(currentLatency || 0)));
//         }
//       }, 1000);

//       return () => {
//         console.log("🧹 Cleaning up HLS player");
//         clearInterval(latencyInterval);
//         if (reconnectTimerRef.current) {
//           clearTimeout(reconnectTimerRef.current);
//         }
//         if (hlsRef.current) {
//           hlsRef.current.destroy();
//           hlsRef.current = null;
//         }
//         video.removeEventListener("playing", () => {});
//         video.removeEventListener("pause", () => {});
//         video.removeEventListener("waiting", () => {});
//         video.removeEventListener("canplay", () => {});
//         video.removeEventListener("error", () => {});
//       };
//     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       // Safari native HLS
//       console.log("📱 Using native HLS (Safari)");
//       video.src = fullUrl;
//       video.addEventListener("loadedmetadata", () => {
//         console.log("✅ Native HLS loaded");
//         setIsLoading(false);
//         video.play().catch((err) => {
//           console.warn("⚠️ Autoplay prevented:", err);
//         });
//       });
//     } else {
//       console.error("❌ HLS not supported");
//       setError("HLS streaming not supported in this browser");
//       setIsLoading(false);
//     }

//     return () => {
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//       if (video) {
//         video.src = "";
//         video.load();
//       }
//       if (reconnectTimerRef.current) {
//         clearTimeout(reconnectTimerRef.current);
//       }
//     };
//   }, [child?._id, child?.status, child?.hlsUrl, child?.hlsUrl]);

//   // Check if stream needs to be started
//   useEffect(() => {
//     const isValidCamera = child?._id && child?.status === "active";
//     const hasStream = !!child?.hlsUrl;

//     if (isValidCamera && !hasStream && !isLoading) {
//       setShowStartButton(true);
//     } else {
//       setShowStartButton(false);
//     }
//   }, [child?._id, child?.status, child?.hlsUrl, isLoading]);

//   // Handle fullscreen
//   const handleFullscreen = () => {
//     if (containerRef.current) {
//       if (!isFullscreen) {
//         containerRef.current.requestFullscreen().catch(console.error);
//         setIsFullscreen(true);
//       } else {
//         document.exitFullscreen().catch(console.error);
//         setIsFullscreen(false);
//       }
//     }
//   };

//   // Handle screenshot with timestamp
//   const handleScreenshot = () => {
//     const video = videoRef.current;
//     if (!video) return;

//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth || 1280;
//     canvas.height = video.videoHeight || 720;
//     const ctx = canvas.getContext("2d");
    
//     // Draw video frame
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
//     // Add watermark
//     ctx.fillStyle = 'rgba(0,0,0,0.5)';
//     ctx.fillRect(10, canvas.height - 40, 200, 30);
//     ctx.fillStyle = 'white';
//     ctx.font = '12px Arial';
//     ctx.fillText(`📷 ${child?.name || 'Camera'} • ${new Date().toLocaleString()}`, 20, canvas.height - 20);

//     const screenshot = canvas.toDataURL("image/png");
//     if (screenshot) {
//       const link = document.createElement("a");
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//       link.download = `screenshot-${child?.name || "camera"}-${timestamp}.png`;
//       link.href = screenshot;
//       link.click();
//     }
//   };

//   // Handle refresh with exponential backoff
//   const handleRefresh = () => {
//     console.log("🔄 Refreshing stream...");
//     setError(null);
//     setIsLoading(true);
//     setIsBuffering(false);
//     setConnectionAttempts(0);

//     if (hlsRef.current) {
//       const fullUrl = child?.hlsUrl?.startsWith('http') 
//         ? child.hlsUrl 
//         : `http://localhost:5000${child?.hlsUrl || ''}`;
//       hlsRef.current.loadSource(fullUrl);
//     } else if (videoRef.current) {
//       videoRef.current.load();
//       videoRef.current.play().catch(console.warn);
//     }
//   };

//   // Handle retry
//   const handleRetry = () => {
//     console.log("🔄 Retrying connection...");
//     setError(null);
//     setIsLoading(true);
//     handleRefresh();
//   };

//   // Handle start stream
//   const handleStartStream = () => {
//     console.log("▶️ Starting stream for camera:", child?._id);
//     if (onStreamStart) {
//       onStreamStart(child?._id);
//     } else if (window.startCameraStream) {
//       window.startCameraStream(child?._id);
//     }
//   };

//   // Listen for stream start events
//   useEffect(() => {
//     const handleStreamStarted = (event) => {
//       console.log("📡 Stream started event received:", event.detail);
//       if (event.detail.cameraId === child?._id) {
//         setShowStartButton(false);
//         setIsLoading(true);
//         setTimeout(() => handleRefresh(), 2000);
//       }
//     };

//     window.addEventListener("streamStarted", handleStreamStarted);
//     return () => {
//       window.removeEventListener("streamStarted", handleStreamStarted);
//     };
//   }, [child?._id]);

//   // Toggle mute
//   const toggleMute = () => {
//     const video = videoRef.current;
//     if (video) {
//       video.muted = !video.muted;
//       setIsMuted(video.muted);
//     }
//   };

//   // Check if camera is viewable
//   const isValidCamera = child?._id && child?.status === "active";
//   const hasStreamUrl = !!child?.hlsUrl;

//   const aspectRatioClass = {
//     video: "aspect-video",
//     square: "aspect-square",
//     portrait: "aspect-[9/16]",
//     auto: "aspect-auto"
//   }[aspectRatio] || "aspect-video";

//   return (
//     <div
//       ref={containerRef}
//       className={`relative w-full ${aspectRatioClass} bg-black rounded-xl overflow-hidden shadow-2xl group border border-slate-300 ${className}`}
//     >
//       {/* Live Indicator */}
//       <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
//         <span
//           className={`w-2.5 h-2.5 rounded-full animate-pulse ${
//             isPlaying && hasStreamUrl
//               ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
//               : isLoading
//                 ? "bg-yellow-500"
//                 : "bg-gray-500"
//           }`}
//         ></span>
//         <span className="text-white text-xs font-bold tracking-wide uppercase">
//           {isPlaying && hasStreamUrl
//             ? "Live"
//             : isLoading
//               ? "Connecting..."
//               : hasStreamUrl
//                 ? "Disconnected"
//                 : isValidCamera
//                   ? "Stopped"
//                   : "Offline"}
//         </span>
//         {isRecording && (
//           <Badge className="ml-1 bg-red-500 text-white text-[8px] px-1 py-0 animate-pulse">
//             REC
//           </Badge>
//         )}
//         {isBuffering && !isLoading && (
//           <Badge className="ml-1 bg-yellow-500 text-white text-[8px] px-1 py-0 animate-pulse">
//             BUFFERING
//           </Badge>
//         )}
//       </div>

//       {/* Camera Name and Info */}
//       <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
//         <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white/90 text-xs font-medium">
//           {child?.name || "Camera"} 
//           {child?.class && ` • ${child.class}`}
//         </div>
//         {/* Quality Indicator */}
//         {isPlaying && hasStreamUrl && (
//           <StreamQualityIndicator
//             bitrate={bitrate} 
//             latency={latency}
//             quality={videoQuality}
//           />
//         )}
//       </div>

//       {/* Video Player */}
//       {isValidCamera ? (
//         <>
//           <video
//             ref={videoRef}
//             className="w-full h-full object-contain"
//             playsInline
//             muted={isMuted}
//             autoPlay
//           />

//           {/* Start Stream Button */}
//           {showStartButton && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/90">
//               <div className="text-center max-w-sm p-6 bg-white/5 rounded-xl border border-white/10">
//                 <div className="text-4xl mb-3">📹</div>
//                 <p className="text-white font-bold mb-2">Stream Not Started</p>
//                 <p className="text-white/70 text-sm mb-4">
//                   Click below to start the live stream
//                 </p>
//                 <button
//                   onClick={handleStartStream}
//                   className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
//                 >
//                   <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
//                   Start Live Stream
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Loading Overlay */}
//           {isLoading && !showStartButton && (
//             <VideoStatusOverlay
//               type="loading"
//               message="Loading stream..."
//               subMessage={child?.hlsUrl ? "Connecting to stream..." : "Waiting for stream..."}
//             />
//           )}

//           {/* Error Overlay */}
//           {error && !showStartButton && (
//             <VideoStatusOverlay
//               type="error"
//               message="Stream Error"
//               subMessage={error}
//               onRetry={handleRetry}
//             />
//           )}

//           {/* Recording Controls - Only in full view */}
//           {showControls && !isPreview && (
//             <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//               <RecordingControls
//                 child={child}
//                 onRecordingStart={() => setIsRecording(true)}
//                 onRecordingStop={() => setIsRecording(false)}
//               />
//             </div>
//           )}

//           {/* Stream Info */}
//           <div className="absolute bottom-4 left-4 z-10 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-white/60 text-[10px] font-mono">
//             {isPlaying && hasStreamUrl
//               ? "🟢 Streaming"
//               : hasStreamUrl
//                 ? "🔴 Disconnected"
//                 : "⏸️ Stopped"}
//             {hasStreamUrl && (
//               <span className="ml-2">• {new Date().toLocaleTimeString()}</span>
//             )}
//           </div>
//         </>
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-slate-900">
//           <div className="text-center text-white/50">
//             <div className="text-4xl mb-2">📹</div>
//             <p className="font-medium">
//               Camera is {child?.status || "offline"}
//             </p>
//             <p className="text-xs mt-1">
//               {!child?._id ? "No camera data" : "Camera not active"}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Controls */}
//       {showControls && (
//         <LiveFeedControls
//           onScreenshot={handleScreenshot}
//           onRefresh={handleRefresh}
//           onFullscreen={handleFullscreen}
//           isPlaying={isPlaying}
//           buffering={isBuffering}
//           isFullscreen={isFullscreen}
//           onToggleMute={toggleMute}
//           isMuted={isMuted}
//           hasStream={hasStreamUrl}
//           onStartStream={handleStartStream}
//           showStartButton={showStartButton}
//           isValidCamera={isValidCamera}
//         />
//       )}
//     </div>
//   );
// };


// frontend/src/components/LiveFeed/LiveFeedVideo.jsx
import React, { useRef, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { RecordingControls } from "@/components/Recording/RecordingControls";
import { LiveFeedControls } from "./LiveFeedControls";
import { VideoStatusOverlay } from "./VideoStatusOverlay";
import { StreamQualityIndicator } from "./StreamQualityIndicator";
import Hls from "hls.js";

export const LiveFeedVideo = ({ 
  child, 
  isPreview = false,
  onStreamStart,
  onStreamStop,
  showControls = true,
  className = "",
  aspectRatio = "video",
  onFullscreenChange
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveURL, setLiveURL] = useState(child?.hlsUrl);
  const [isMuted, setIsMuted] = useState(true);
  const [showStartButton, setShowStartButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [videoQuality, setVideoQuality] = useState('auto');
  const [bitrate, setBitrate] = useState(0);
  const [latency, setLatency] = useState(0);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement === containerRef.current;
      setIsFullscreen(isFull);
      if (onFullscreenChange) {
        onFullscreenChange(isFull);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

  // Debug logging
  useEffect(() => {
    console.log("🔍 LiveFeedVideo - Child Data:", {
      name: child?.name,
      id: child?._id,
      hasCamera: child?.hasCamera,
      hlsUrl: child?.hlsUrl,
      isStreaming: child?.isStreaming,
      streamStatus: child?.streamStatus,
      status: child?.status,
    });
  }, [child]);

  // Initialize HLS Player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isValidCamera = child?._id && child?.status === "active";
    const hasStreamUrl = !!child?.hlsUrl;

    if (!isValidCamera || !hasStreamUrl) {
      setIsLoading(false);
      if (!isValidCamera) {
        setError("Camera is not active");
      }
      return;
    }

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Clear any reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const fullUrl = child?.hlsUrl?.startsWith('http') 
      ? child.hlsUrl 
      : `http://localhost:5000${child?.hlsUrl || ''}`;
    
    console.log("📹 Initializing HLS with URL:", fullUrl);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backbufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        startLevel: -1,
        debug: false,
        fragLoadingTimeOut: 20000,
        manifestLoadingTimeOut: 10000,
        levelLoadingTimeOut: 10000,
      });

      hlsRef.current = hls;
      hls.loadSource(fullUrl);
      hls.attachMedia(video);

      // Event handlers
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("✅ HLS Media attached");
        setIsLoading(false);
        setError(null);
        setConnectionAttempts(0);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("✅ HLS Manifest parsed, levels:", data.levels.length);
        setIsLoading(false);
        setError(null);
        
        video.play().catch((err) => {
          console.warn("⚠️ Autoplay prevented:", err);
          if (err.name === 'NotAllowedError') {
            setError("Click to play video");
          }
        });
      });

      hls.on(Hls.Events.FRAG_CHANGED, () => {
        setIsBuffering(false);
      });

      hls.on(Hls.Events.FRAG_LOADING, () => {
        setIsBuffering(true);
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        setIsBuffering(false);
        if (data.frag.stats && data.frag.stats.totalduration) {
          const bitrate = (data.frag.stats.totalbytes * 8) / data.frag.stats.totalduration / 1000;
          setBitrate(Math.round(bitrate));
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setVideoQuality(`Level ${data.level}`);
        setIsBuffering(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("❌ HLS Error:", data);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("⚠️ Network error, retrying...");
              if (connectionAttempts < 3) {
                setConnectionAttempts(prev => prev + 1);
                setTimeout(() => {
                  if (hlsRef.current) {
                    hlsRef.current.startLoad();
                  }
                }, 2000);
              } else {
                setError("Network error. Please refresh.");
                setIsLoading(false);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("⚠️ Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("❌ Fatal error:", data);
              setError("Failed to load stream. Please try again.");
              setIsLoading(false);
              break;
          }
        } else {
          if (data.details === 'manifestLoadError') {
            setError("Stream not available");
            setIsLoading(false);
          }
        }
      });

      // Video event handlers
      video.addEventListener("playing", () => {
        console.log("▶️ Video playing");
        setIsPlaying(true);
        setIsLoading(false);
        setError(null);
        setConnectionAttempts(0);
      });

      video.addEventListener("pause", () => {
        console.log("⏸️ Video paused");
        setIsPlaying(false);
      });

      video.addEventListener("waiting", () => {
        console.log("⏳ Video waiting/buffering");
        setIsBuffering(true);
      });

      video.addEventListener("canplay", () => {
        console.log("✅ Video can play");
        setIsLoading(false);
        setError(null);
      });

      video.addEventListener("error", (e) => {
        console.error("❌ Video element error:", e);
        const errorMessage = video.error?.message || "Video playback error";
        setError(errorMessage);
        setIsLoading(false);
      });

      // Calculate latency
      const latencyInterval = setInterval(() => {
        if (video.currentTime > 0) {
          const currentLatency = video.currentTime - (hlsRef.current?.liveSyncPosition || 0);
          setLatency(Math.round(Math.abs(currentLatency || 0)));
        }
      }, 1000);

      return () => {
        console.log("🧹 Cleaning up HLS player");
        clearInterval(latencyInterval);
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        video.removeEventListener("playing", () => {});
        video.removeEventListener("pause", () => {});
        video.removeEventListener("waiting", () => {});
        video.removeEventListener("canplay", () => {});
        video.removeEventListener("error", () => {});
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      console.log("📱 Using native HLS (Safari)");
      video.src = fullUrl;
      video.addEventListener("loadedmetadata", () => {
        console.log("✅ Native HLS loaded");
        setIsLoading(false);
        video.play().catch((err) => {
          console.warn("⚠️ Autoplay prevented:", err);
        });
      });
    } else {
      console.error("❌ HLS not supported");
      setError("HLS streaming not supported in this browser");
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.src = "";
        video.load();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [child?._id, child?.status, child?.hlsUrl]);

  // Check if stream needs to be started
  useEffect(() => {
    const isValidCamera = child?._id && child?.status === "active";
    const hasStream = !!child?.hlsUrl;

    if (isValidCamera && !hasStream && !isLoading) {
      setShowStartButton(true);
    } else {
      setShowStartButton(false);
    }
  }, [child?._id, child?.status, child?.hlsUrl, isLoading]);

  // Handle fullscreen - Fixed version
  const handleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (containerRef.current) {
          if (containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
          } else if (containerRef.current.webkitRequestFullscreen) {
            await containerRef.current.webkitRequestFullscreen();
          } else if (containerRef.current.mozRequestFullScreen) {
            await containerRef.current.mozRequestFullScreen();
          } else if (containerRef.current.msRequestFullscreen) {
            await containerRef.current.msRequestFullscreen();
          }
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
      // Fallback: try to use CSS fullscreen
      if (!isFullscreen) {
        containerRef.current?.classList.add('fixed', 'inset-0', 'z-50', 'rounded-none');
      } else {
        containerRef.current?.classList.remove('fixed', 'inset-0', 'z-50', 'rounded-none');
      }
    }
  };

  // Handle screenshot with timestamp
  const handleScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Add watermark
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, canvas.height - 40, 200, 30);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`📷 ${child?.name || 'Camera'} • ${new Date().toLocaleString()}`, 20, canvas.height - 20);

    const screenshot = canvas.toDataURL("image/png");
    if (screenshot) {
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `screenshot-${child?.name || "camera"}-${timestamp}.png`;
      link.href = screenshot;
      link.click();
    }
  };

  // Handle refresh with exponential backoff
  const handleRefresh = () => {
    console.log("🔄 Refreshing stream...");
    setError(null);
    setIsLoading(true);
    setIsBuffering(false);
    setConnectionAttempts(0);

    if (hlsRef.current) {
      const fullUrl = child?.hlsUrl?.startsWith('http') 
        ? child.hlsUrl 
        : `http://localhost:5000${child?.hlsUrl || ''}`;
      hlsRef.current.loadSource(fullUrl);
    } else if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(console.warn);
    }
  };

  // Handle retry
  const handleRetry = () => {
    console.log("🔄 Retrying connection...");
    setError(null);
    setIsLoading(true);
    handleRefresh();
  };

  // Handle start stream
  const handleStartStream = () => {
    console.log("▶️ Starting stream for camera:", child?._id);
    if (onStreamStart) {
      onStreamStart(child?._id);
    } else if (window.startCameraStream) {
      window.startCameraStream(child?._id);
    }
  };

  // Listen for stream start events
  useEffect(() => {
    const handleStreamStarted = (event) => {
      console.log("📡 Stream started event received:", event.detail);
      if (event.detail.cameraId === child?._id) {
        setShowStartButton(false);
        setIsLoading(true);
        setTimeout(() => handleRefresh(), 2000);
      }
    };

    window.addEventListener("streamStarted", handleStreamStarted);
    return () => {
      window.removeEventListener("streamStarted", handleStreamStarted);
    };
  }, [child?._id]);

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  // Check if camera is viewable
  const isValidCamera = child?._id && child?.status === "active";
  const hasStreamUrl = !!child?.hlsUrl;

  const aspectRatioClass = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[9/16]",
    auto: "aspect-auto"
  }[aspectRatio] || "aspect-video";

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${aspectRatioClass} bg-black rounded-xl overflow-hidden shadow-2xl group border border-slate-300 ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Live Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
        <span
          className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            isPlaying && hasStreamUrl
              ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
              : isLoading
                ? "bg-yellow-500"
                : "bg-gray-500"
          }`}
        ></span>
        <span className="text-white text-xs font-bold tracking-wide uppercase">
          {isPlaying && hasStreamUrl
            ? "Live"
            : isLoading
              ? "Connecting..."
              : hasStreamUrl
                ? "Disconnected"
                : isValidCamera
                  ? "Stopped"
                  : "Offline"}
        </span>
        {isRecording && (
          <Badge className="ml-1 bg-red-500 text-white text-[8px] px-1 py-0 animate-pulse">
            REC
          </Badge>
        )}
        {isBuffering && !isLoading && (
          <Badge className="ml-1 bg-yellow-500 text-white text-[8px] px-1 py-0 animate-pulse">
            BUFFERING
          </Badge>
        )}
      </div>

      {/* Camera Name and Info */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white/90 text-xs font-medium">
          {child?.name || "Camera"} 
          {child?.class && ` • ${child.class}`}
        </div>
        {isPlaying && hasStreamUrl && (
          <StreamQualityIndicator 
            bitrate={bitrate} 
            latency={latency}
            quality={videoQuality}
          />
        )}
      </div>

      {/* Video Player */}
      {isValidCamera ? (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted={isMuted}
            autoPlay
          />

          {/* Start Stream Button */}
          {showStartButton && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
              <div className="text-center max-w-sm p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-4xl mb-3">📹</div>
                <p className="text-white font-bold mb-2">Stream Not Started</p>
                <p className="text-white/70 text-sm mb-4">
                  Click below to start the live stream
                </p>
                <button
                  onClick={handleStartStream}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Start Live Stream
                </button>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && !showStartButton && (
            <VideoStatusOverlay 
              type="loading"
              message="Loading stream..."
              subMessage={child?.hlsUrl ? "Connecting to stream..." : "Waiting for stream..."}
            />
          )}

          {/* Error Overlay */}
          {error && !showStartButton && (
            <VideoStatusOverlay 
              type="error"
              message="Stream Error"
              subMessage={error}
              onRetry={handleRetry}
            />
          )}

          {/* Recording Controls */}
          {showControls && !isPreview && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <RecordingControls
                child={child}
                onRecordingStart={() => setIsRecording(true)}
                onRecordingStop={() => setIsRecording(false)}
              />
            </div>
          )}

          {/* Stream Info */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-white/60 text-[10px] font-mono">
            {isPlaying && hasStreamUrl
              ? "🟢 Streaming"
              : hasStreamUrl
                ? "🔴 Disconnected"
                : "⏸️ Stopped"}
            {hasStreamUrl && (
              <span className="ml-2">• {new Date().toLocaleTimeString()}</span>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <div className="text-center text-white/50">
            <div className="text-4xl mb-2">📹</div>
            <p className="font-medium">
              Camera is {child?.status || "offline"}
            </p>
            <p className="text-xs mt-1">
              {!child?._id ? "No camera data" : "Camera not active"}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <LiveFeedControls
          onScreenshot={handleScreenshot}
          onRefresh={handleRefresh}
          onFullscreen={handleFullscreen}
          isPlaying={isPlaying}
          buffering={isBuffering}
          isFullscreen={isFullscreen}
          onToggleMute={toggleMute}
          isMuted={isMuted}
          hasStream={hasStreamUrl}
          onStartStream={handleStartStream}
          showStartButton={showStartButton}
          isValidCamera={isValidCamera}
        />
      )}
    </div>
  );
};