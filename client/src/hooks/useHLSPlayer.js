// frontend/src/hooks/useHLSPlayer.js
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

export const useHLSPlayer = (hlsUrl, options = {}) => {
  const {
    autoPlay = true,
    muted = false,
    enableWorker = true,
    lowLatencyMode = true,
    maxBufferLength = 10,
    liveSyncDurationCount = 3,
  } = options;

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);

  const initHLS = useCallback(() => {
    if (!hlsUrl || !videoRef.current) return;

    // Clean up existing instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker,
        lowLatencyMode,
        maxBufferLength,
        liveSyncDurationCount,
        backbufferLength: 30,
        maxMaxBufferLength: 30,
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        enableStallDetection: true,
        stallDuration: 0.5,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(() => setIsLoading(false));
        }
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("HLS media attached");
      });

      hls.on(Hls.Events.FRAG_LOADING, () => {
        setIsBuffering(true);
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsBuffering(false);
      });

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        setIsBuffering(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Fatal network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Fatal media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              setError("Stream error: " + (data.details || "Unknown error"));
              setIsLoading(false);
              break;
          }
        }
      });

      hlsRef.current = hls;

      // Video event listeners
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleWaiting = () => setIsBuffering(true);
      const handleCanPlay = () => {
        setIsBuffering(false);
        setIsLoading(false);
      };
      const handleStalled = () => {
        console.warn("Video stalled, attempting recovery");
        if (hlsRef.current) {
          hlsRef.current.recoverMediaError();
        }
      };

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("stalled", handleStalled);

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("stalled", handleStalled);
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support
      video.src = hlsUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(console.error);
        }
      });
      video.addEventListener("error", () => {
        setError("Failed to load stream");
        setIsLoading(false);
      });
    } else {
      setError("HLS is not supported in this browser");
      setIsLoading(false);
    }
  }, [hlsUrl, autoPlay, enableWorker, lowLatencyMode, maxBufferLength, liveSyncDurationCount]);

  useEffect(() => {
    const cleanup = initHLS();
    return () => {
      if (cleanup) cleanup();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [initHLS]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    initHLS();
  }, [initHLS]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, []);

  const takeScreenshot = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    }
    return null;
  }, []);

  return {
    videoRef,
    hlsRef,
    isLoading,
    isPlaying,
    isBuffering,
    error,
    refresh,
    togglePlay,
    toggleMute,
    takeScreenshot,
    setError,
    setIsLoading,
  };
};