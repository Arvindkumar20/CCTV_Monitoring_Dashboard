// frontend/src/components/CameraDashboard/CameraCard.jsx
import React, { useState } from "react";
import { 
  VideoOff, 
  Power, 
  Play, 
  Square,
  MoreVertical,
  Eye,
  RefreshCw,
  Settings
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LiveFeedVideo } from "@/pages/parent-portal/LiveFeed/LiveFeedVideo";

export const CameraCard = ({ camera, onView, onActivate, onStreamToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = camera.status === "active";
  const isOnline = camera.streamStatus === "online";
  const isStreaming = camera.isStreaming || false;

  const getStatusBadge = () => {
    if (isActive && isOnline) {
      return {
        label: "Active • Online",
        color: "bg-green-100 text-green-800 border-green-200",
        dotColor: "bg-green-500 animate-pulse",
      };
    } else if (isActive && !isOnline) {
      return {
        label: "Active • Offline",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        dotColor: "bg-yellow-500",
      };
    } else {
      return {
        label: "Inactive",
        color: "bg-gray-100 text-gray-600 border-gray-200",
        dotColor: "bg-gray-400",
      };
    }
  };

  const status = getStatusBadge();

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Preview */}
      <div className="relative aspect-video bg-black cursor-pointer" onClick={() => onView(camera)}>
        {isActive ? (
          <LiveFeedVideo
            child={camera} 
            isPreview={true} 
            showControls={false}
            className="rounded-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center text-white/50">
              <VideoOff size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Camera Offline</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color} backdrop-blur-sm bg-opacity-90 shadow-sm`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
            {status.label}
          </div>
        </div>

        {/* Stream Indicator */}
        {isStreaming && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-500/90 text-white border-red-600 backdrop-blur-sm shadow-lg shadow-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </div>
          </div>
        )}

        {/* Quick Action Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onView(camera); }}
            className="px-4 py-2 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition shadow-lg flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onActivate(camera._id); }}
            className={`px-4 py-2 rounded-lg font-medium transition shadow-lg flex items-center gap-2 ${
              isActive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            <Power className="w-4 h-4" />
            {isActive ? "Deactivate" : "Activate"}
          </button>
          {isActive && (
            <button
              onClick={(e) => { e.stopPropagation(); onStreamToggle(camera); }}
              className={`px-4 py-2 rounded-lg font-medium transition shadow-lg flex items-center gap-2 ${
                isStreaming
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isStreaming ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isStreaming ? "Stop" : "Start"}
            </button>
          )}
        </div>
      </div>

      {/* Camera Info */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-800 text-sm truncate">{camera.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500 truncate">{camera.class}</p>
              {camera.location && (
                <>
                  <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                  <p className="text-xs text-slate-400 truncate">{camera.location}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-[10px] text-slate-500 font-medium">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {camera.resolution && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {camera.resolution}
              </span>
            )}
            {camera.fps && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {camera.fps} FPS
              </span>
            )}
          </div>
          
          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-slate-100 rounded-lg transition">
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onView(camera)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onActivate(camera._id)}>
                <Power className="w-4 h-4 mr-2" />
                {isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStreamToggle(camera)}>
                {isStreaming ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isStreaming ? 'Stop Stream' : 'Start Stream'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};