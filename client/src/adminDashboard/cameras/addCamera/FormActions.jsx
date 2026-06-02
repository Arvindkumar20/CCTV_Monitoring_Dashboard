// components/camera/AddCameraForm/FormActions.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

export const FormActions = ({ onCancel, isSubmitting = false }) => {
  return (
    <div className="flex items-center gap-4 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="flex-1 py-3.5 border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex-[2] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Camera
          </>
        )}
      </Button>
    </div>
  );
};

// Skeleton
export const FormActionsSkeleton = () => (
  <div className="flex items-center gap-4 pt-2">
    <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
    <div className="flex-[2] h-12 bg-slate-200 rounded-xl animate-pulse" />
  </div>
);