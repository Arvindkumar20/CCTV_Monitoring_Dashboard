// components/parent-portal/ChildrenGrid.jsx
import React from "react";
import { ChildCard, ChildCardSkeleton } from "./ChildCard";

export const ChildrenGrid = ({ children, onSelectChild }) => {
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {children.map((child) => (
          <ChildCard key={child.id} child={child} onClick={onSelectChild} />
        ))}
      </div>
    </main>
  );
};

// Grid Skeleton
export const ChildrenGridSkeleton = () => (
  <main className="flex-1 p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[...Array(3)].map((_, i) => (
        <ChildCardSkeleton key={i} />
      ))}
    </div>
  </main>
);