// pages/settings/SaveButton.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle } from "lucide-react";

export const SaveButton = ({ onSave, isSaving, isSaved }) => {
  return (
    <div className="flex justify-end sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 border-t border-gray-200 rounded-b-lg">
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : isSaved ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Saved
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
};