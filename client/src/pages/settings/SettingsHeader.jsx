// components/settings/SettingsHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SettingsHeader = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <Button
        variant="outline"
        onClick={() => navigate("/dashboard")}
        className="px-4 py-2 bg-white border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium"
      >
        <Home className="w-4 h-4 mr-2" />
        Dashboard
      </Button>
    </div>
  );
};

// Header Skeleton
export const SettingsHeaderSkeleton = () => (
  <div className="flex items-center justify-between">
    <div className="space-y-2">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
    </div>
    <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
  </div>
);