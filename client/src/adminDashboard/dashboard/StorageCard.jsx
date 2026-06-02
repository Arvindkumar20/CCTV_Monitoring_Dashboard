// components/dashboard/StorageCard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardDrive } from "lucide-react";

export const StorageCard = ({ used, total, percentage }) => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Cloud Storage</p>
            <h4 className="text-xl font-bold text-slate-900">{used} / {total}</h4>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-slate-500 mt-2">{percentage}% space used (30-day retention)</p>
      </CardContent>
    </Card>
  );
};

// Storage Card Skeleton
export const StorageCardSkeleton = () => (
  <Card className="border-slate-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
      </div>
      <div className="h-2 bg-slate-200 rounded-full w-full mb-2 animate-pulse" />
      <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
    </CardContent>
  </Card>
);