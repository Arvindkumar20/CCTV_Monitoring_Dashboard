import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";

export const ParentHeader = ({ 
  title, 
  subtitle, 
  showBack = false, 
  onBack, 
  onLogout 
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              {subtitle}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="text-slate-600 hover:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export const ParentHeaderSkeleton = () => (
  <header className="bg-white border-b border-slate-200 px-6 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
        <div>
          <div className="h-6 w-32 bg-slate-200 rounded mb-1 animate-pulse" />
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-9 w-20 bg-slate-200 rounded animate-pulse" />
    </div>
  </header>
);