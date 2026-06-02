// components/guardian/AddGuardianForm/FormHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const FormHeader = ({ title, description, onClose }) => {
  return (
    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

// Header Skeleton
export const FormHeaderSkeleton = () => (
  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
    <div className="space-y-2">
      <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
    </div>
    <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
  </div>
);