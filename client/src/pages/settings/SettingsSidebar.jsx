// pages/settings/SettingsSidebar.jsx
import React from "react";
import { 
  Home, 
  User, 
  Palette, 
  Shield, 
  Settings as SettingsIcon,
  Building2,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General", icon: Home },
  { id: "profile", label: "Profile", icon: User },
  // { id: "branding", label: "Branding", icon: Palette },
  { id: "system", label: "System", icon: SettingsIcon },
  { id: "security", label: "Security", icon: Shield },
];

export const SettingsSidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Settings
      </h3>
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-gray-50",
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-blue-600" : "text-gray-400"
              )} />
              <span className="text-sm">{tab.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-8 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export const SettingsSidebarSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-4" />
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  </div>
);