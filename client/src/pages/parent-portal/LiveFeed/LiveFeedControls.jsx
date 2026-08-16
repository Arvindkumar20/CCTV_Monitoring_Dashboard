// frontend/src/components/LiveFeed/LiveFeedControls.jsx
import React from "react";
import { 
  Camera, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Volume2, 
  VolumeX,
  Play,
  Power
} from "lucide-react";

export const LiveFeedControls = ({ 
  onScreenshot, 
  onRefresh, 
  onFullscreen, 
  isPlaying = false,
  buffering = false,
  isFullscreen = false,
  onToggleMute,
  isMuted = false,
  hasStream = false,
  onStartStream,
  showStartButton = false,
  isValidCamera = false
}) => {
  if (!isValidCamera) return null;

  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      
      {/* Start Stream */}
      {showStartButton && onStartStream && (
        <button
          onClick={onStartStream}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white text-xs font-medium shadow-lg hover:shadow-green-500/20"
          title="Start Live Stream"
        >
          <Play className="w-3.5 h-3.5" />
          Start
        </button>
      )}

      {/* Screenshot */}
      {hasStream && (
        <button
          onClick={onScreenshot}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
          title="Take Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>
      )}

      {/* Refresh */}
      {hasStream && (
        <button
          onClick={onRefresh}
          className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white ${
            buffering ? 'animate-spin' : ''
          }`}
          title="Refresh Stream"
          disabled={buffering}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}

      {/* Mute/Unmute */}
      {hasStream && (
        <button
          onClick={onToggleMute}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Fullscreen */}
      <button
        onClick={onFullscreen}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </button>

      {/* Status */}
      {hasStream && (
        <div className="ml-1 flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-[10px] text-white/80 font-medium tracking-wide">
            {isPlaying ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
      )}
    </div>
  );
};