import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Video, 
  Users, 
  Layers, 
  UserCheck,
  Camera,
  Shield,
  Activity,
  Bell,
  Calendar,
  Clock,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle,
  Home,
  Settings,
  UserPlus,
  FolderPlus
} from "lucide-react";

// Icon mapping object - yahan se icon resolve hoga
const iconMap = {
  // Default icons
  Video,
  Users,
  Layers,
  TrendingUp,
  UserCheck,
  Camera,
  Shield,
  Activity,
  Bell,
  Calendar,
  Clock,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle,
  Home,
  Settings,
  UserPlus,
  FolderPlus,
  
  // Aliases for common names
  "video": Video,
  "camera": Camera,
  "users": Users,
  "layers": Layers,
  "trending": TrendingUp,
  "user-check": UserCheck,
  "shield": Shield,
  "activity": Activity,
  "bell": Bell,
  "calendar": Calendar,
  "clock": Clock,
  "download": Download,
  "upload": Upload,
  "alert": AlertCircle,
  "check": CheckCircle,
  "x": XCircle,
  "home": Home,
  "settings": Settings,
  "user-plus": UserPlus,
  "folder-plus": FolderPlus
};

export const StatCard = ({ 
  title, 
  value = 0, 
  subtitle, 
  icon: Icon, 
  iconBg, 
  trend,
  iconName // Alternative: icon name as string
}) => {
  
  // Resolve icon - either from Icon prop or from iconName string
  const ResolvedIcon = Icon || (iconName ? iconMap[iconName] : null) || TrendingUp;
  
  // Determine text color based on iconBg
  const getTextColor = (bgClass) => {
    if (!bgClass) return "text-blue-600";
    
    if (bgClass.includes("blue")) return "text-blue-600";
    if (bgClass.includes("emerald")) return "text-emerald-600";
    if (bgClass.includes("green")) return "text-green-600";
    if (bgClass.includes("red")) return "text-red-600";
    if (bgClass.includes("yellow")) return "text-yellow-600";
    if (bgClass.includes("amber")) return "text-amber-600";
    if (bgClass.includes("purple")) return "text-purple-600";
    if (bgClass.includes("indigo")) return "text-indigo-600";
    if (bgClass.includes("pink")) return "text-pink-600";
    if (bgClass.includes("slate")) return "text-slate-600";
    
    return "text-blue-600";
  };

  const textColor = getTextColor(iconBg);

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title || "Statistic"}</p>
            <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
            {trend ? (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            ) : (
              subtitle && <p className="text-xs text-slate-400">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 ${iconBg || "bg-blue-100"} rounded-full flex items-center justify-center`}>
            <ResolvedIcon className={`w-6 h-6 ${textColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Simplified version with auto icon resolution
export const SimpleStatCard = ({ 
  title, 
  value, 
  subtitle, 
  iconType, // e.g., "camera", "users", "layers"
  color = "blue" // "blue", "green", "purple", etc.
}) => {
  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
    slate: { bg: "bg-slate-100", text: "text-slate-600" }
  };

  const IconComponent = iconMap[iconType] || iconMap[iconType?.toLowerCase()] || TrendingUp;
  const colors = colorMap[color] || colorMap.blue;

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Stat Card Skeleton
export const StatCardSkeleton = () => (
  <Card className="border-slate-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
      </div>
    </CardContent>
  </Card>
);