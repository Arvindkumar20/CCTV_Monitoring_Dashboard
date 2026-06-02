import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { LiveFeedControls } from "./LiveFeedControls";

export const LiveFeedVideo = ({ child }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!child?.hasCamera || !child?.hlsUrl) return;

    let hls = null;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 10,
          maxMaxBufferLength: 30,
          enableWorker: true
        });

        hls.loadSource(child.hlsUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          videoRef.current.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data);
          setError("Stream error occurred");
          setLoading(false);
        });
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        videoRef.current.src = child.hlsUrl;
        videoRef.current.addEventListener("loadedmetadata", () => {
          setLoading(false);
          videoRef.current.play().catch(console.error);
        });
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [child]);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      
      const link = document.createElement("a");
      link.download = `screenshot-${child.name}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group border border-slate-300">
      {/* Live Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
        <span className="text-white text-xs font-bold tracking-wide uppercase">Live</span>
      </div>

      {/* Camera Name */}
      <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white/90 text-xs font-medium">
        {child.name} • {child.class}
      </div>

      {/* Video Player */}
      {child.hasCamera ? (
        <>
          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            muted={false}
          />
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white">
              <div className="text-center">
                <p className="text-red-500 font-bold mb-2">Stream Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <div className="text-center text-white/50">
            <div className="text-4xl mb-2">📹</div>
            <p>Camera is offline</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <LiveFeedControls
        onScreenshot={handleScreenshot}
        onRefresh={handleRefresh}
        onFullscreen={handleFullscreen}
      />
    </div>
  );
};