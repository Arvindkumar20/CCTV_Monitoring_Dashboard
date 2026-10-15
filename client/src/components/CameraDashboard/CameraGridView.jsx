// frontend/src/components/CameraDashboard/CameraGridView.jsx
import React, { useState } from "react";
import { CameraGridCell } from "./CameraGridCell";
import { Button } from "@/components/ui/button";
import { Grid2x2, Grid3x3, LayoutGrid, X } from "lucide-react";

/**
 * CameraGridView - iMotive style multi-camera grid
 * Shows 4, 6, 9, or 16 cameras in a tight grid
 */
export const CameraGridView = ({ cameras, onClose }) => {
  const [gridSize, setGridSize] = useState(4); // 4, 6, 9, 16
  const [fullscreenCamera, setFullscreenCamera] = useState(null);

  // Take first N cameras
  const visibleCameras = cameras.slice(0, gridSize);

  // Fill empty slots
  const emptySlots = Math.max(0, gridSize - visibleCameras.length);

  // Grid cols based on size
  const getGridCols = () => {
    switch (gridSize) {
      case 4:
        return "grid-cols-2";
      case 6:
        return "grid-cols-3";
      case 9:
        return "grid-cols-3";
      case 16:
        return "grid-cols-4";
      default:
        return "grid-cols-2";
    }
  };

  const handleSnapshot = (camera, videoElement) => {
    if (!videoElement) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth || 1280;
      canvas.height = videoElement.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const link = document.createElement("a");
      link.download = `snapshot-${camera.name}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Snapshot failed:", err);
    }
  };

  const handleFullscreen = (camera) => {
    setFullscreenCamera(camera);
  };

  // Fullscreen single camera view
  if (fullscreenCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullscreenCamera(null)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <X className="w-4 h-4 mr-1" /> Close
          </Button>
        </div>
        <div className="w-full h-full">
          <CameraGridCell
            camera={fullscreenCamera}
            index={0}
            onFullscreen={() => {}}
            onSnapshot={handleSnapshot}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col py-5 overflow-scroll">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold text-sm">Live View</h2>
          <span className="text-slate-400 text-xs">
            ({visibleCameras.length} cameras)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid size selector */}
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            {[4, 6, 9, 16].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`px-3 py-1 text-xs rounded transition ${
                  gridSize === size
                    ? "bg-blue-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className={`flex-1 grid ${getGridCols()} gap-0.5 p-0.5 bg-black`}>
        {visibleCameras.map((camera, index) => (
          <CameraGridCell
            key={camera._id}
            camera={camera}
            index={index}
            onFullscreen={handleFullscreen}
            onSnapshot={handleSnapshot}
          />
        ))}

        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-black border border-slate-800 aspect-video"
          ></div>
        ))}
      </div>
    </div>
  );
};