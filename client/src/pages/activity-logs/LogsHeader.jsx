// components/activity-logs/LogsHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LogsHeader = ({ title, description, onExport }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onExport}
          className="px-4 py-2 bg-white border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-medium"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-medium"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </div>
    </div>
  );
};

// Header Skeleton
export const LogsHeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="space-y-2">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
      <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
    </div>
  </div>
);