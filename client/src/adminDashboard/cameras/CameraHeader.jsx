// components/camera/CameraHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CameraHeader = ({ title, description, onAddClick }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="text-slate-600 hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </div>
    </div>
  );
};

// Header Skeleton
export const CameraHeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="space-y-2">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse" />
      <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
    </div>
  </div>
);