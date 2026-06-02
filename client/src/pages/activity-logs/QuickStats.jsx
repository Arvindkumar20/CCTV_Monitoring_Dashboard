// components/activity-logs/QuickStats.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Clock } from "lucide-react";

const statConfig = {
  successful: {
    icon: TrendingUp,
    label: "Successful Logins (24h)",
    color: "text-slate-400",
    valueColor: "text-slate-900",
  },
  failed: {
    icon: AlertTriangle,
    label: "Failed Attempts (24h)",
    color: "text-red-400",
    valueColor: "text-red-600",
  },
  downtime: {
    icon: Clock,
    label: "Total Downtime Incidents",
    color: "text-amber-500",
    valueColor: "text-amber-600",
  },
};

export const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(stats).map(([key, value]) => {
        const config = statConfig[key];
        const Icon = config.icon;
        
        return (
          <Card key={key} className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <p className={`text-[10px] font-bold ${config.color} uppercase tracking-widest`}>
                {config.label}
              </p>
              <p className={`text-2xl font-bold ${config.valueColor} mt-1`}>
                {value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Stats Skeleton
export const QuickStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="border-slate-200">
        <CardContent className="p-5 space-y-2">
          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    ))}
  </div>
);