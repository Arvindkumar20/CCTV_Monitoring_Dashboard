// components/settings/SystemPreferencesCard.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code } from "lucide-react";

export const SystemPreferencesCard = ({ 
  preferences, 
  onToggle3rdLevel,
  onPasswordFormatChange,
  storageData 
}) => {
  const storagePercentage = (storageData?.used / storageData?.total) * 100 || 0;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-100">
        <CardTitle className="font-bold text-slate-800">System Preferences</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Toggle 3rd Level */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-700">Enable 3rd Level Category</h3>
            <p className="text-xs text-slate-500">Allow grouping by Sub-Sections (e.g. Batches)</p>
          </div>
          <Switch
            checked={preferences?.enable3rdLevel || false}
            onCheckedChange={onToggle3rdLevel}
          />
        </div>

        {/* Password Rule */}
        <div className="pt-4 border-t border-slate-100">
          <Label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Guardian Password Format
          </Label>
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">
              <Code className="w-4 h-4" />
            </div>
            <span className="text-sm font-mono font-bold text-blue-800">
              First 3 Letters + DOB (DDMM)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 italic">
            Changing this will only affect new registrations.
          </p>
        </div>

        {/* Storage Limit */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">
              Cloud Storage Limit
            </Label>
            <Badge variant="outline" className="text-xs font-bold text-slate-700">
              {Math.round(storagePercentage)}% Used
            </Badge>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          <p className="text-[10px] text-slate-400 mt-2 text-right">
            {storageData?.used}GB / {storageData?.total}GB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton
export const SystemPreferencesCardSkeleton = () => (
  <Card className="border-slate-200">
    <CardHeader className="p-6 border-b border-slate-100">
      <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-6 w-11 bg-slate-200 rounded-full animate-pulse" />
      </div>
      <div className="h-16 bg-slate-200 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-2 bg-slate-200 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);