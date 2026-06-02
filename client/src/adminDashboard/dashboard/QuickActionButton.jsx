// components/dashboard/QuickActionButton.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const colorClasses = {
  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
  slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white",
};

export const QuickActionButton = ({ icon: Icon, label, color = "blue", onClick }) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 h-auto bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-all", colorClasses[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </Button>
  );
};

// Quick Action Button Skeleton
export const QuickActionButtonSkeleton = () => (
  <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl">
    <div className="w-10 h-10 bg-slate-200 rounded-lg mb-2 animate-pulse" />
    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
  </div>
);