// frontend/src/components/CameraDashboard/CameraStats.jsx
import React from "react";
import { Camera, Power, Wifi, WifiOff, VideoOff } from "lucide-react";

export const CameraStats = ({ stats }) => {
  const statCards = [
    {
      title: "Total Cameras",
      value: stats.total || 0,
      icon: Camera,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Active Cameras",
      value: stats.active || 0,
      icon: Power,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Online",
      value: stats.online || 0,
      icon: Wifi,
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "Offline",
      value: stats.offline || 0,
      icon: WifiOff,
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
    {
      title: "Inactive",
      value: stats.inactive || 0,
      icon: VideoOff,
      color: "red",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-4 transition hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">{stat.title}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-2 rounded-lg bg-white/60`}>
              <stat.icon size={20} className={stat.textColor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};