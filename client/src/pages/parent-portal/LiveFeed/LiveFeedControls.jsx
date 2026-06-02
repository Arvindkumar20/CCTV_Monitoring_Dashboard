import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Maximize2 } from "lucide-react";

export const LiveFeedControls = ({ onScreenshot, onRefresh, onFullscreen }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        onClick={onScreenshot}
        className="h-8 w-8 text-white hover:text-blue-400 hover:bg-white/10"
      >
        <Camera className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        className="h-8 w-8 text-white hover:text-blue-400 hover:bg-white/10"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onFullscreen}
        className="h-8 w-8 text-white hover:text-blue-400 hover:bg-white/10"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
};