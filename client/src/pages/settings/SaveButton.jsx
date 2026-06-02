// components/settings/SaveButton.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

export const SaveButton = ({ onSave, isSaving = false }) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </>
        )}
      </Button>
    </div>
  );
};

// Skeleton
export const SaveButtonSkeleton = () => (
  <div className="h-14 bg-slate-200 rounded-2xl animate-pulse" />
);