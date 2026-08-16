// frontend/src/components/CameraDashboard/CameraGrid.jsx
import React from "react";
import { CameraCard } from "./CameraCard";

export const CameraGrid = ({ cameras, cols, onView, onActivate, onStreamToggle }) => {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }[cols] || 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 gap-4 ${gridCols}`}>
      {cameras.map((camera) => (
        <CameraCard
          key={camera._id}
          camera={camera}
          onView={onView}
          onActivate={onActivate}
          onStreamToggle={onStreamToggle}
        />
      ))}
    </div>
  );
};