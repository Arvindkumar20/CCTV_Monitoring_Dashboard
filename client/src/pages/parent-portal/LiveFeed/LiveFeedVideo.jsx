
// // frontend/src/components/LiveFeed/LiveFeedVideo.jsx
// import React, {
//   useRef,
//   useState,
//   useEffect,
//   forwardRef,
//   useImperativeHandle,
// } from "react";
// import { VideoOff } from "lucide-react";
// import Hls from "hls.js";

// export const LiveFeedVideo = forwardRef(
//   (
//     {
//       child,
//       isPreview = false,
//       showControls = true,
//       className = "",
//       aspectRatio = "video",
//       autoPlay = true,
//       forcePlay = false,
//     },
//     ref,
//   ) => {
//     const [isLoading, setIsLoading] = useState(true);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [isBuffering, setIsBuffering] = useState(false);
//     const [error, setError] = useState(null);
//     const videoRef = useRef(null);
//     const hlsRef = useRef(null);
//     const timeIntervalRef = useRef(null);
//     const playAttempts = useRef(0);
//     const maxPlayAttempts = 5;
//     const isMounted = useRef(true);

//     // Expose video element
//     useImperativeHandle(ref, () => ({
//       videoElement: videoRef.current,
//       getVideoElement: () => videoRef.current,
//     }));

//     // ✅ Force auto-play with retry
//     const forceAutoPlay = async (video) => {
//       if (!video || !isMounted.current) return false;

//       try {
//         video.muted = true;
//         const playPromise = video.play();

//         if (playPromise !== undefined) {
//           await playPromise;
//           setIsPlaying(true);
//           setIsLoading(false);
//           setError(null);
//           playAttempts.current = 0;
//           return true;
//         }
//       } catch (err) {
//         if (playAttempts.current < maxPlayAttempts && isMounted.current) {
//           playAttempts.current++;
//           const delay = 500 * Math.pow(1.5, playAttempts.current);
//           setTimeout(() => {
//             if (isMounted.current) forceAutoPlay(video);
//           }, delay);
//         } else {
//           setIsLoading(false);
//           setError("Click to play");
//           playAttempts.current = 0;
//         }
//         return false;
//       }
//     };

//     // React to forcePlay prop change
//     useEffect(() => {
//       if (forcePlay && videoRef.current) {
//         setTimeout(() => forceAutoPlay(videoRef.current), 300);
//       }
//     }, [forcePlay]);

//     // Main HLS setup
//     useEffect(() => {
//       isMounted.current = true;
//       const video = videoRef.current;
//       if (!video) return;

//       const isValidCamera = child?._id && child?.status === "active";
//       const hasStreamUrl = !!child?.hlsUrl;

//       if (!isValidCamera || !hasStreamUrl) {
//         setIsLoading(false);
//         return;
//       }

//       // Cleanup previous
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }

//       const fullUrl = child?.hlsUrl?.startsWith("http")
//         ? child.hlsUrl
//         : `${import.meta.env.VITE_APP_API_URL}${child?.hlsUrl || ""}`;

//       if (Hls.isSupported()) {
//         const hls = new Hls({
//           enableWorker: true,
//           lowLatencyMode: true,
//           backbufferLength: 30,
//           maxBufferLength: 30,
//           startLevel: -1,
//           debug: false,
//           fragLoadingTimeOut: 20000,
//           manifestLoadingTimeOut: 10000,
//           autoStartLoad: true,
//           startFragPrefetch: true,
//         });

//         hlsRef.current = hls;
//         hls.loadSource(fullUrl);
//         hls.attachMedia(video);

//         hls.on(Hls.Events.MEDIA_ATTACHED, () => {
//           setIsLoading(false);
//           setError(null);
//           if (autoPlay || forcePlay) {
//             setTimeout(() => {
//               if (isMounted.current) forceAutoPlay(video);
//             }, 200);
//           }
//         });

//         hls.on(Hls.Events.MANIFEST_PARSED, () => {
//           setIsLoading(false);
//           setError(null);
//           if (autoPlay || forcePlay) {
//             setTimeout(() => {
//               if (isMounted.current) forceAutoPlay(video);
//             }, 200);
//           }
//         });

//         hls.on(Hls.Events.FRAG_LOADED, () => {
//           setIsBuffering(false);
//           if ((autoPlay || forcePlay) && !isPlaying && isMounted.current) {
//             forceAutoPlay(video);
//           }
//         });

//         hls.on(Hls.Events.ERROR, (event, data) => {
//           console.error(`HLS Error for ${child.name}:`, data);
//           if (data.fatal) {
//             if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
//               setTimeout(() => {
//                 if (hlsRef.current) hlsRef.current.startLoad();
//               }, 2000);
//             } else {
//               setError("Stream error");
//               setIsLoading(false);
//             }
//           }
//         });

//         // Video events
//         const onPlaying = () => {
//           setIsPlaying(true);
//           setIsLoading(false);
//           setError(null);
//           playAttempts.current = 0;
//         };
//         const onPause = () => setIsPlaying(false);
//         const onWaiting = () => setIsBuffering(true);
//         const onCanPlay = () => {
//           setIsLoading(false);
//           setError(null);
//           if ((autoPlay || forcePlay) && !isPlaying && isMounted.current) {
//             forceAutoPlay(video);
//           }
//         };

//         video.addEventListener("playing", onPlaying);
//         video.addEventListener("pause", onPause);
//         video.addEventListener("waiting", onWaiting);
//         video.addEventListener("canplay", onCanPlay);

//         return () => {
//           isMounted.current = false;
//           video.removeEventListener("playing", onPlaying);
//           video.removeEventListener("pause", onPause);
//           video.removeEventListener("waiting", onWaiting);
//           video.removeEventListener("canplay", onCanPlay);
//           if (hlsRef.current) {
//             hlsRef.current.destroy();
//             hlsRef.current = null;
//           }
//           if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
//         };
//       } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//         // Safari native HLS
//         video.src = fullUrl;
//         video.addEventListener("loadedmetadata", () => {
//           setIsLoading(false);
//           if (autoPlay || forcePlay) {
//             setTimeout(() => forceAutoPlay(video), 200);
//           }
//         });
//       } else {
//         setError("HLS not supported");
//         setIsLoading(false);
//       }

//       return () => {
//         isMounted.current = false;
//         if (hlsRef.current) {
//           hlsRef.current.destroy();
//           hlsRef.current = null;
//         }
//       };
//     }, [child?._id, child?.status, child?.hlsUrl, autoPlay, forcePlay]);

//     const handleManualPlay = () => {
//       const video = videoRef.current;
//       if (video) {
//         setIsLoading(true);
//         setError(null);
//         playAttempts.current = 0;
//         forceAutoPlay(video);
//       }
//     };

//     const isValidCamera = child?._id && child?.status === "active";

//     const aspectRatioClass =
//       {
//         video: "aspect-video",
//         square: "aspect-square",
//         portrait: "aspect-[9/16]",
//         auto: "aspect-auto",
//       }[aspectRatio] || "aspect-video";

//     return (
//       <div className={`relative w-full ${aspectRatioClass} bg-black ${className}`}>
//         {isValidCamera ? (
//           <>
//             <video
//               ref={videoRef}
//               className="w-full h-full object-contain"
//               playsInline
//               muted
//               autoPlay
//               preload="auto"
//               controls={false}
//             />

//             {isLoading && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black/50">
//                 <div className="flex flex-col items-center gap-2">
//                   <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                   <p className="text-white/60 text-xs">Connecting...</p>
//                 </div>
//               </div>
//             )}

//             {error === "Click to play" && (
//               <div
//                 className="absolute inset-0 flex items-center justify-center bg-black/70 cursor-pointer"
//                 onClick={handleManualPlay}
//               >
//                 <div className="text-center">
//                   <button className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110">
//                     <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
//                   </button>
//                   <p className="text-white/60 text-xs mt-3">Click to play</p>
//                 </div>
//               </div>
//             )}

//             {error && error !== "Click to play" && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black/70">
//                 <div className="text-center">
//                   <p className="text-red-400 text-sm font-medium">{error}</p>
//                   <button
//                     onClick={() => {
//                       setError(null);
//                       setIsLoading(true);
//                       if (hlsRef.current) hlsRef.current.startLoad();
//                       handleManualPlay();
//                     }}
//                     className="mt-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition"
//                   >
//                     Retry
//                   </button>
//                 </div>
//               </div>
//             )}

//             {isBuffering && (
//               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                 <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-slate-900">
//             <div className="text-center text-white/30">
//               <VideoOff size={32} className="mx-auto mb-2 opacity-30" />
//               <p className="text-xs font-medium">Camera Offline</p>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   },
// );

// LiveFeedVideo.displayName = "LiveFeedVideo";








// frontend/src/components/LiveFeed/LiveFeedVideo.jsx
import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { VideoOff, RefreshCw, AlertCircle } from "lucide-react";
import Hls from "hls.js";

/**
 * ✅ LiveFeedVideo — plays HLS stream directly from `child.hlsUrl`
 * No API calls inside. Backend already handles stream start.
 */
export const LiveFeedVideo = forwardRef(
  (
    {
      child,
      isPreview = false,
      showControls = true,
      className = "",
      aspectRatio = "video",
      autoPlay = true,
      forcePlay = false,
    },
    ref,
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const retryTimerRef = useRef(null);
    const isMounted = useRef(true);
    const playAttempts = useRef(0);
    const MAX_PLAY_ATTEMPTS = 3;
    const MAX_HLS_RETRIES = 8; // ✅ stream warm-up ke liye retries

    // Expose video element to parent
    useImperativeHandle(ref, () => ({
      videoElement: videoRef.current,
      getVideoElement: () => videoRef.current,
    }));

    // ✅ Build full URL (relative → absolute)
    const buildFullUrl = useCallback((url) => {
      if (!url) return null;
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      const base = import.meta.env.VITE_APP_API_URL || "";
      return `${base.replace(/\/$/, "")}${url}`;
    }, []);

    // ✅ Force autoplay with retry (browser policy handle)
    const forceAutoPlay = useCallback(async (video) => {
      if (!video || !isMounted.current) return false;
      try {
        video.muted = true; // ✅ browsers allow muted autoplay
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          if (isMounted.current) {
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);
            playAttempts.current = 0;
          }
          return true;
        }
      } catch (err) {
        if (playAttempts.current < MAX_PLAY_ATTEMPTS && isMounted.current) {
          playAttempts.current++;
          const delay = 500 * playAttempts.current;
          setTimeout(() => {
            if (isMounted.current) forceAutoPlay(video);
          }, delay);
        } else {
          if (isMounted.current) {
            setIsLoading(false);
            setError("Click to play");
            playAttempts.current = 0;
          }
        }
      }
      return false;
    }, []);

    // ✅ Reset & re-init when camera changes
    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    // ✅ Main HLS setup — reacts to hlsUrl change
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const isValidCamera = child?._id && child?.status === "active";
      const hlsUrl = child?.hlsUrl;

      if (!isValidCamera || !hlsUrl) {
        setIsLoading(false);
        return;
      }

      // Cleanup previous instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      const fullUrl = buildFullUrl(hlsUrl);
      setError(null);
      setIsLoading(true);
      setRetryCount(0);

      // ✅ Browser native HLS (Safari)
      if (!Hls.isSupported() && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = fullUrl;
        const onLoaded = () => {
          setIsLoading(false);
          if (autoPlay || forcePlay) forceAutoPlay(video);
        };
        const onError = () => {
          setIsLoading(false);
          setError("Stream unavailable");
        };
        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("error", onError);
        return () => {
          video.removeEventListener("loadedmetadata", onLoaded);
          video.removeEventListener("error", onError);
        };
      }

      if (!Hls.isSupported()) {
        setError("HLS not supported in this browser");
        setIsLoading(false);
        return;
      }

      // ✅ HLS.js setup
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backbufferLength: 10,
        maxBufferLength: 6,          // ✅ kam buffer = low latency
        maxMaxBufferLength: 10,
        liveSyncDurationCount: 2,    // ✅ 3 → 2 (faster)
        liveMaxLatencyDurationCount: 5,
        startLevel: -1,
        debug: false,

        // ✅ Stream warm-up ke liye aggressive retry
        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 1000,
        levelLoadingTimeOut: 8000,
        levelLoadingMaxRetry: 6,
        fragLoadingTimeOut: 15000,
        fragLoadingMaxRetry: 8,

        autoStartLoad: true,
        startFragPrefetch: true,
      });

      hlsRef.current = hls;
      hls.loadSource(fullUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (isMounted.current) setIsLoading(false);
        if (autoPlay || forcePlay) {
          setTimeout(() => forceAutoPlay(video), 200);
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isMounted.current) {
          setIsLoading(false);
          setError(null);
        }
        if (autoPlay || forcePlay) {
          setTimeout(() => forceAutoPlay(video), 200);
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        if (isMounted.current) {
          setIsBuffering(false);
          if ((autoPlay || forcePlay) && !isPlaying) {
            forceAutoPlay(video);
          }
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!isMounted.current) return;

        // ✅ Manifest 404 = stream abhi ready nahi → retry
        if (
          data.fatal &&
          data.type === Hls.ErrorTypes.NETWORK_ERROR &&
          (data.details === "manifestLoadError" ||
            data.details === "manifestLoadTimeOut")
        ) {
          setRetryCount((prev) => {
            const next = prev + 1;
            if (next <= MAX_HLS_RETRIES) {
              // Exponential backoff, max 3s
              const delay = Math.min(1000 * next, 3000);
              retryTimerRef.current = setTimeout(() => {
                if (isMounted.current && hlsRef.current) {
                  hlsRef.current.startLoad();
                }
              }, delay);
            } else {
              setError("Stream failed to start. Try refreshing.");
              setIsLoading(false);
            }
            return next;
          });
          return;
        }

        // Other network errors → simple retry
        if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setTimeout(() => {
            if (isMounted.current && hlsRef.current) {
              hlsRef.current.startLoad();
            }
          }, 2000);
          return;
        }

        // Media errors → recover
        if (data.fatal && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        // Unknown fatal
        if (data.fatal) {
          setError("Stream error");
          setIsLoading(false);
        }
      });

      // Video element events
      const onPlaying = () => {
        if (!isMounted.current) return;
        setIsPlaying(true);
        setIsLoading(false);
        setIsBuffering(false);
        setError(null);
        playAttempts.current = 0;
      };
      const onPause = () => isMounted.current && setIsPlaying(false);
      const onWaiting = () => isMounted.current && setIsBuffering(true);
      const onCanPlay = () => {
        if (!isMounted.current) return;
        setIsLoading(false);
        if ((autoPlay || forcePlay) && !isPlaying) forceAutoPlay(video);
      };

      video.addEventListener("playing", onPlaying);
      video.addEventListener("pause", onPause);
      video.addEventListener("waiting", onWaiting);
      video.addEventListener("canplay", onCanPlay);

      return () => {
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("pause", onPause);
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("canplay", onCanPlay);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
      };
    }, [
      child?._id,
      child?.status,
      child?.hlsUrl,
      autoPlay,
      forcePlay,
      buildFullUrl,
      forceAutoPlay,
    ]);

    // React to external forcePlay changes
    useEffect(() => {
      if (forcePlay && videoRef.current && isMounted.current) {
        setTimeout(() => forceAutoPlay(videoRef.current), 300);
      }
    }, [forcePlay, forceAutoPlay]);

    // ✅ Manual retry handler
    const handleManualRetry = useCallback(() => {
      setError(null);
      setIsLoading(true);
      setRetryCount(0);
      playAttempts.current = 0;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      // Re-trigger effect by resetting internal state — simplest approach:
      // Force re-mount of HLS by toggling a key in parent is cleaner,
      // but here we just startLoad + play
      if (videoRef.current) {
        forceAutoPlay(videoRef.current);
      }
    }, [forceAutoPlay]);

    const handleManualPlay = useCallback(() => {
      if (videoRef.current) {
        setIsLoading(true);
        setError(null);
        playAttempts.current = 0;
        forceAutoPlay(videoRef.current);
      }
    }, [forceAutoPlay]);

    const isValidCamera = child?._id && child?.status === "active";
    const aspectRatioClass =
      {
        video: "aspect-video",
        square: "aspect-square",
        portrait: "aspect-[9/16]",
        auto: "aspect-auto",
      }[aspectRatio] || "aspect-video";

    return (
      <div className={`relative w-full ${aspectRatioClass} bg-black ${className}`}>
        {isValidCamera ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted
              autoPlay
              preload="auto"
              controls={false}
            />

            {/* Loading */}
            {isLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <p className="text-white/60 text-xs">
                    {retryCount > 0
                      ? `Starting stream... (${retryCount}/${MAX_HLS_RETRIES})`
                      : "Connecting..."}
                  </p>
                </div>
              </div>
            )}

            {/* Click to play (autoplay blocked) */}
            {error === "Click to play" && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/70 cursor-pointer"
                onClick={handleManualPlay}
              >
                <div className="text-center">
                  <button className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110">
                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                  </button>
                  <p className="text-white/60 text-xs mt-3">Click to play</p>
                </div>
              </div>
            )}

            {/* Error with retry */}
            {error && error !== "Click to play" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center px-4">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                  <button
                    onClick={handleManualRetry}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Buffering spinner */}
            {isBuffering && !isLoading && !error && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <div className="text-center text-white/30">
              <VideoOff size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">Camera Offline</p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

LiveFeedVideo.displayName = "LiveFeedVideo";