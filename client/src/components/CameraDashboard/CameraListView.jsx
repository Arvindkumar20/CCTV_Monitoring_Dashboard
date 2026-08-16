// frontend/src/components/CameraDashboard/CameraListView.jsx
import React, { useState } from "react";
import { 
  VideoOff, 
  Power, 
  Play, 
  Square,
  Eye,
  MoreVertical,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  ChevronRight
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const CameraListView = ({ cameras, onView, onActivate, onStreamToggle }) => {
  const [expandedId, setExpandedId] = useState(null);

  const getStatusBadge = (camera) => {
    const isActive = camera.status === "active";
    const isOnline = camera.streamStatus === "online";

    if (isActive && isOnline) {
      return {
        label: "Active • Online",
        color: "bg-green-100 text-green-800 border-green-200",
        dotColor: "bg-green-500 animate-pulse",
        icon: <Wifi className="w-3 h-3" />
      };
    } else if (isActive && !isOnline) {
      return {
        label: "Active • Offline",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        dotColor: "bg-yellow-500",
        icon: <WifiOff className="w-3 h-3" />
      };
    } else {
      return {
        label: "Inactive",
        color: "bg-gray-100 text-gray-600 border-gray-200",
        dotColor: "bg-gray-400",
        icon: <Power className="w-3 h-3" />
      };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
        <div className="col-span-3">Camera</div>
        <div className="col-span-2">Class</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Stream</div>
        <div className="col-span-2">Last Activity</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Camera List */}
      <div className="divide-y divide-slate-100">
        {cameras.map((camera) => {
          const status = getStatusBadge(camera);
          const isActive = camera.status === "active";
          const isStreaming = camera.isStreaming || false;
          const isExpanded = expandedId === camera._id;

          return (
            <div 
              key={camera._id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              {/* Main Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-6 py-4 items-center">
                {/* Camera Info */}
                <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                    {isActive ? (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <span className="text-white/30 text-xs">📹</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <VideoOff className="w-5 h-5 text-slate-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">
                      {camera.name}
                    </h4>
                    {camera.location && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{camera.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Class - Hidden on mobile (shown in expanded view) */}
                <div className="hidden md:block col-span-2">
                  <span className="text-sm text-slate-600">{camera.class || 'N/A'}</span>
                </div>

                {/* Status */}
                <div className="col-span-1 md:col-span-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                    {status.icon}
                    <span className="hidden sm:inline">{status.label}</span>
                    <span className="sm:hidden">
                      {camera.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Stream Status */}
                <div className="col-span-1 md:col-span-2">
                  {isStreaming ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-medium text-red-600">Live</span>
                      {camera.streamQuality && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {camera.streamQuality}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Not streaming</span>
                  )}
                </div>

                {/* Last Activity */}
                <div className="hidden md:block col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(camera.updatedAt || camera.lastActive)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1">
                  {/* Quick Actions - Desktop */}
                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      onClick={() => onView(camera)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                      title="View Camera"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {isActive && (
                      <button
                        onClick={() => onStreamToggle(camera)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isStreaming
                            ? 'hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700'
                            : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'
                        }`}
                        title={isStreaming ? "Stop Stream" : "Start Stream"}
                      >
                        {isStreaming ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    )}
                    
                    <button
                      onClick={() => onActivate(camera._id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'hover:bg-red-100 text-red-500 hover:text-red-700'
                          : 'hover:bg-green-100 text-green-500 hover:text-green-700'
                      }`}
                      title={isActive ? "Deactivate" : "Activate"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* More Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onView(camera)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onActivate(camera._id)}>
                        <Power className="w-4 h-4 mr-2" />
                        {isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      {isActive && (
                        <DropdownMenuItem onClick={() => onStreamToggle(camera)}>
                          {isStreaming ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {isStreaming ? 'Stop Stream' : 'Start Stream'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-slate-400">
                        <Clock className="w-4 h-4 mr-2" />
                        Last Active: {formatDate(camera.updatedAt)}
                      </DropdownMenuItem>
                      {camera.ipAddress && (
                        <DropdownMenuItem className="text-slate-400">
                          <Wifi className="w-4 h-4 mr-2" />
                          IP: {camera.ipAddress}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mobile Expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : camera._id)}
                    className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded Mobile View */}
              {isExpanded && (
                <div className="md:hidden px-4 pb-4 pt-2 bg-slate-50/50 rounded-b-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Class</p>
                      <p className="font-medium text-slate-700">{camera.class || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="font-medium text-slate-700">{camera.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Resolution</p>
                      <p className="font-medium text-slate-700">{camera.resolution || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">FPS</p>
                      <p className="font-medium text-slate-700">{camera.fps || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400">Last Activity</p>
                      <p className="font-medium text-slate-700">{formatDate(camera.updatedAt)}</p>
                    </div>
                    <div className="col-span-2 flex gap-2 mt-2">
                      <button
                        onClick={() => onView(camera)}
                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {isActive && (
                        <button
                          onClick={() => onStreamToggle(camera)}
                          className={`flex-1 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                            isStreaming
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {isStreaming ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {isStreaming ? 'Stop' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {cameras.length === 0 && (
        <div className="text-center py-12">
          <VideoOff className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No cameras found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};