// frontend/src/components/CameraDashboard/CameraGridCell.jsx
import React, { useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera as CameraIcon,
  Maximize2,
  VideoOff,
} from "lucide-react";
import Hls from "hls.js";

export const CameraGridCell = ({
  camera,
  onFullscreen,
  onSnapshot,
  index,
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isActive = camera.status === "active";
  const isStreaming = camera.isStreaming;

  // Init HLS
  React.useEffect(() => {
    if (!isActive || !camera.hlsUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Cleanup
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const fullUrl = camera.hlsUrl.startsWith("http")
      ? camera.hlsUrl
      : `${import.meta.env.VITE_APP_API_URL}${camera.hlsUrl}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
        backbufferLength: 10,
        maxBufferLength: 15,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 4,
      });

      hlsRef.current = hls;
      hls.loadSource(fullUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = true;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.log("Autoplay blocked:", err.message);
            setIsLoading(false);
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setTimeout(() => hlsRef.current?.startLoad(), 2000);
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }
  }, [camera._id, camera.hlsUrl, isActive]);

  const togglePlayPause = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Empty/inactive cell
  if (!isActive) {
    return (
      <div className="relative bg-black border border-slate-700 aspect-video flex items-center justify-center">
        <div className="text-center text-white/20">
          <VideoOff size={28} className="mx-auto mb-1" />
          <p className="text-[10px]">{camera.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black border border-slate-700 aspect-video group overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        autoPlay
        preload="auto"
        controls={false}
      />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <p className="text-red-400 text-xs">Stream error</p>
        </div>
      )}

      {/* Timestamp overlay (top-left) */}
      {isPlaying && (
        <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-white/90 font-mono">
          {new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      )}

      {/* Camera name (bottom center) */}
      <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-medium whitespace-nowrap">
        {camera.name}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm flex items-center justify-between px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-0.5">
          <button
            onClick={togglePlayPause}
            className="p-1 hover:bg-white/20 rounded transition"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-white" />
            ) : (
              <Play className="w-3 h-3 text-white" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="p-1 hover:bg-white/20 rounded transition"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3 text-white" />
            ) : (
              <Volume2 className="w-3 h-3 text-white" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSnapshot?.(camera, videoRef.current);
            }}
            className="p-1 hover:bg-white/20 rounded transition"
            title="Snapshot"
          >
            <CameraIcon className="w-3 h-3 text-white" />
          </button>
        </div>

        <div className="text-[9px] text-white/60 font-mono truncate max-w-[40%]">
          {camera.channel || `CH-${index + 1}`}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFullscreen?.(camera);
          }}
          className="p-1 hover:bg-white/20 rounded transition"
          title="Fullscreen"
        >
          <Maximize2 className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
};