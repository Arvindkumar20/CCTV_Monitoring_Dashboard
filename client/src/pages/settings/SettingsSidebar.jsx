// components/settings/SettingsSidebar.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  School, 
  Layers, 
  Shield, 
  HardDrive,
  Settings as SettingsIcon 
} from "lucide-react";

const menuItems = [
  { id: "general", icon: School, label: "General Info" },
  { id: "system", icon: Layers, label: "System Logic" },
  { id: "security", icon: Shield, label: "Security" },
//   { id: "storage", icon: HardDrive, label: "Storage & API" },
];

export const SettingsSidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="md:col-span-1 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            onClick={() => onTabChange(item.id)}
            className={`
              w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-all
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Button>
        );
      })}
    </div>
  );
};

// Sidebar Skeleton
export const SettingsSidebarSkeleton = () => (
  <div className="md:col-span-1 space-y-2">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse" />
    ))}
  </div>
);