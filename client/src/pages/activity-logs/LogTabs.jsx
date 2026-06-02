// components/activity-logs/LogTabs.jsx
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, UserX, VideoOff } from "lucide-react";

const tabs = [
  {
    id: "guardian",
    label: "Guardian Logins",
    icon: UserCheck,
    color: "text-blue-600",
  },
  {
    id: "failed",
    label: "Failed Login Attempts",
    icon: UserX,
    color: "text-red-500",
  },
  {
    id: "camera",
    label: "Camera Downtime",
    icon: VideoOff,
    color: "text-amber-600",
  },
];

export const LogTabs = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b border-slate-100 bg-slate-50/50 h-auto p-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`
                px-6 py-4 text-sm whitespace-nowrap rounded-none
                ${isActive 
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold bg-transparent' 
                  : 'text-slate-500 font-semibold hover:text-slate-700'
                }
              `}
            >
              <Icon className={`w-4 h-4 mr-2 inline-block ${isActive ? tab.color : ''}`} />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

// Tabs Skeleton
export const LogTabsSkeleton = () => (
  <div className="border-b border-slate-100 bg-slate-50/50 flex gap-2 p-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
    ))}
  </div>
);