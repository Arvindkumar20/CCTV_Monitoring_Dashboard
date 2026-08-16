
// // CameraDashboard.jsx
// import React, { useState, useEffect } from "react";
// import { Camera, VideoOff, Power, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
// import { useCameras } from "@/hooks/useCameras";
// import { LiveFeedVideo } from "./parent-portal/LiveFeed/LiveFeedVideo";
// import { requestStoragePermission } from "@/utils/storagePermission";

// export const CameraDashboard = () => {
//   const {
//     cameras,
//     loading,
//     error,
//     stats,
//     pagination,
//     fetchCameras,
//     statusToggle,
//     getOnlineCount,
//     getOfflineCount,
//     getActiveCount,
//     getInactiveCount,
//     startStream,
//     stopStream,
//   } = useCameras();

//   const [selectedCamera, setSelectedCamera] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);

//   useEffect(() => {
//     // Request storage permission when component mounts
//     requestStoragePermission().then(granted => {
//       if (granted) {
//         console.log('Storage permission granted');
//       } else {
//         console.log('Storage permission not granted');
//       }
//     });
//   }, []);

//   // Stats Cards
//   const statsCards = [
//     {
//       title: "Total Cameras",
//       value: cameras.length,
//       icon: Camera,
//       color: "blue",
//       bgColor: "bg-blue-50",
//       textColor: "text-blue-600",
//       borderColor: "border-blue-200",
//     },
//     {
//       title: "Active Cameras",
//       value: getActiveCount(),
//       icon: Power,
//       color: "green",
//       bgColor: "bg-green-50",
//       textColor: "text-green-600",
//       borderColor: "border-green-200",
//     },
//     {
//       title: "Online Streams",
//       value: getOnlineCount(),
//       icon: Camera,
//       color: "purple",
//       bgColor: "bg-purple-50",
//       textColor: "text-purple-600",
//       borderColor: "border-purple-200",
//     },
//     {
//       title: "Offline Streams",
//       value: getOfflineCount(),
//       icon: VideoOff,
//       color: "red",
//       bgColor: "bg-red-50",
//       textColor: "text-red-600",
//       borderColor: "border-red-200",
//     },
//   ];

//   // Handle camera activation
//   const handleActivateCamera = async (cameraId) => {
//     try {
//       await statusToggle(cameraId);
//       await fetchCameras({ page: currentPage });
//     } catch (error) {
//       console.error("Failed to toggle camera status:", error);
//     }
//   };

//   // Handle page change
//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//     fetchCameras({ page: newPage });
//   };

//   // Open camera in full view
//   const handleViewCamera = (camera) => {
//     setSelectedCamera(camera);
//     setIsModalOpen(true);
//   };

//   // Close modal
//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedCamera(null);
//   };

//   if (loading && cameras.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="text-red-500 text-4xl mb-4">⚠️</div>
//           <p className="text-red-600 font-semibold">{error}</p>
//           <button
//             onClick={() => fetchCameras({ page: 1 })}
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
//       {/* Page Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Camera Dashboard</h1>
//           <p className="text-gray-500 text-sm mt-1">
//             Monitor and manage all your cameras
//           </p>
//         </div>
//         <button
//           onClick={() => fetchCameras({ page: currentPage })}
//           className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium"
//         >
//           <RefreshCw size={16} />
//           Refresh
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {statsCards.map((stat) => (
//           <div
//             key={stat.title}
//             className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-4 transition hover:shadow-md`}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium text-gray-500">{stat.title}</p>
//                 <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>
//                   {stat.value}
//                 </p>
//               </div>
//               <div className={`p-2 rounded-lg bg-white/60`}>
//                 <stat.icon size={20} className={stat.textColor} />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Camera Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {cameras.map((camera) => (
//           <CameraCard
//             key={camera._id}
//             camera={camera}
//             onActivate={handleActivateCamera}
//             onView={handleViewCamera}
//             onStartStream={startStream}
//             onStopStream={stopStream}
//           />
//         ))}
//       </div>

//       {/* Empty State */}
//       {cameras.length === 0 && !loading && (
//         <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
//           <Camera size={48} className="mx-auto text-gray-400 mb-4" />
//           <p className="text-gray-500 font-medium">No cameras found</p>
//           <p className="text-gray-400 text-sm">Add a camera to start monitoring</p>
//         </div>
//       )}

//       {/* Pagination */}
//       {pagination.total > pagination.limit && (
//         <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//           <p className="text-sm text-gray-500">
//             Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
//             {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
//             {pagination.total} cameras
//           </p>
//           <div className="flex gap-2">
//             <button
//               onClick={() => handlePageChange(pagination.page - 1)}
//               disabled={pagination.page <= 1}
//               className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
//             >
//               <ChevronLeft size={18} />
//             </button>
//             <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium border border-blue-200">
//               {pagination.page}
//             </span>
//             <button
//               onClick={() => handlePageChange(pagination.page + 1)}
//               disabled={pagination.page >= pagination.pages}
//               className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
//             >
//               <ChevronRight size={18} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Full View Modal */}
//       {isModalOpen && selectedCamera && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
//           <div className="relative w-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
//             {/* Close Button */}
//             <button
//               onClick={closeModal}
//               className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition"
//             >
//               ✕
//             </button>

//             <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
//               <h3 className="font-semibold text-lg">{selectedCamera.name}</h3>
//               <p className="text-sm text-gray-500">{selectedCamera.class}</p>
//             </div>

//             <div className="p-4 flex-1 overflow-hidden">
//               <LiveFeedVideo child={selectedCamera} />
//             </div>

//             <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2 flex-shrink-0">
//               <button
//                 onClick={() => handleActivateCamera(selectedCamera._id)}
//                 className={`flex-1 py-2 rounded-lg font-medium transition ${
//                   selectedCamera.status === "active"
//                     ? "bg-red-500 hover:bg-red-600 text-white"
//                     : "bg-green-500 hover:bg-green-600 text-white"
//                 }`}
//               >
//                 {selectedCamera.status === "active" ? "Deactivate" : "Activate"} Camera
//               </button>
//               <button
//                 onClick={closeModal}
//                 className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Camera Card Component
// const CameraCard = ({ camera, onActivate, onView, onStartStream, onStopStream }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const [isStreaming, setIsStreaming] = useState(camera.isStreaming || false);

//   const isActive = camera.status === "active";
//   const isOnline = camera.streamStatus === "online";

//   // Handle stream toggle
//   const handleStreamToggle = async (e) => {
//     e.stopPropagation();
//     try {
//       if (isStreaming) {
//         await onStopStream(camera._id);
//         setIsStreaming(false);
//       } else {
//         await onStartStream(camera._id);
//         setIsStreaming(true);
//       }
//     } catch (error) {
//       console.error("Failed to toggle stream:", error);
//     }
//   };

//   // Format status badge
//   const getStatusBadge = () => {
//     if (isActive && isOnline) {
//       return {
//         label: "Active • Online",
//         color: "bg-green-100 text-green-800 border-green-200",
//         dotColor: "bg-green-500",
//       };
//     } else if (isActive && !isOnline) {
//       return {
//         label: "Active • Offline",
//         color: "bg-yellow-100 text-yellow-800 border-yellow-200",
//         dotColor: "bg-yellow-500",
//       };
//     } else {
//       return {
//         label: "Inactive",
//         color: "bg-gray-100 text-gray-600 border-gray-200",
//         dotColor: "bg-gray-400",
//       };
//     }
//   };

//   const status = getStatusBadge();

//   return (
//     <div
//       className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Video Preview */}
//       <div className="relative aspect-video bg-black">
//         {isActive ? (
//           <>
//             {/* Small video preview */}
//             <div className="w-full h-full opacity-80">
//               <LiveFeedVideo child={camera} />
//             </div>
//           </>
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-gray-800">
//             <div className="text-center text-white/50">
//               <VideoOff size={32} className="mx-auto mb-2" />
//               <p className="text-sm">Camera Offline</p>
//             </div>
//           </div>
//         )}

//         {/* Status Badge */}
//         <div className="absolute top-2 left-2">
//           <div
//             className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color} backdrop-blur-sm bg-opacity-90`}
//           >
//             <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${isActive ? 'animate-pulse' : ''}`}></span>
//             {status.label}
//           </div>
//         </div>

//         {/* Stream Indicator */}
//         {isStreaming && (
//           <div className="absolute top-2 right-2">
//             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-500/90 text-white border-red-600 backdrop-blur-sm">
//               <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
//               LIVE
//             </div>
//           </div>
//         )}

//         {/* Hover Actions */}
//         <div
//           className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity duration-300 ${
//             isHovered ? "opacity-100" : "opacity-0"
//           }`}
//         >
//           <button
//             onClick={() => onView(camera)}
//             className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition shadow-lg"
//           >
//             View Live
//           </button>
//           <button
//             onClick={() => onActivate(camera._id)}
//             className={`px-4 py-2 rounded-lg font-medium transition shadow-lg ${
//               isActive
//                 ? "bg-red-500 hover:bg-red-600 text-white"
//                 : "bg-green-500 hover:bg-green-600 text-white"
//             }`}
//           >
//             {isActive ? "Deactivate" : "Activate"}
//           </button>
//           {isActive && (
//             <button
//               onClick={handleStreamToggle}
//               className={`px-4 py-2 rounded-lg font-medium transition shadow-lg ${
//                 isStreaming
//                   ? "bg-yellow-500 hover:bg-yellow-600 text-white"
//                   : "bg-blue-500 hover:bg-blue-600 text-white"
//               }`}
//             >
//               {isStreaming ? "Stop Stream" : "Start Stream"}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Camera Info */}
//       <div className="p-3">
//         <div className="flex items-center justify-between">
//           <div>
//             <h4 className="font-semibold text-gray-800 text-sm">{camera.name}</h4>
//             <p className="text-xs text-gray-500">{camera.class}</p>
//           </div>
//           <div className="flex items-center gap-1">
//             <span
//               className={`w-2 h-2 rounded-full ${
//                 isActive ? "bg-green-500" : "bg-gray-300"
//               }`}
//             ></span>
//             <span className="text-xs text-gray-500">
//               {isActive ? "Active" : "Inactive"}
//             </span>
//           </div>
//         </div>
//         {/* Stream URL indicator */}
//         {camera.hlsUrl && (
//           <div className="mt-1">
//             <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
//               ✓ Stream Ready
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };




// frontend/src/components/CameraDashboard/CameraDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { 
  Camera, 
  VideoOff, 
  Power, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Grid3x3,
  Grid2x2,
  Maximize2,
  Settings,
  Search,
  Filter,
  LayoutGrid,
  List
} from "lucide-react";
import { useCameras } from "@/hooks/useCameras";

import { requestStoragePermission } from "@/utils/storagePermission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CameraStats } from "@/components/CameraDashboard/CameraStats";
import { CameraFilters } from "@/components/CameraDashboard/CameraFilters";
import { CameraGrid } from "@/components/CameraDashboard/CameraGrid";
import { CameraListView } from "@/components/CameraDashboard/CameraListView";
import { LiveFeedVideo } from "./parent-portal/LiveFeed/LiveFeedVideo";
import Swal from "sweetalert2";

export const CameraDashboard = () => {
  const {
    cameras,
    loading,
    error,
    stats,
    pagination,
    fetchCameras,
    statusToggle,
    getOnlineCount,
    getOfflineCount,
    getActiveCount,
    getInactiveCount,
    startStream,
    stopStream,
  } = useCameras();

  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [gridCols, setGridCols] = useState(3); // 2, 3, 4
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive' | 'online' | 'offline'
  const [isRefreshing, setIsRefreshing] = useState(false);
  // const { Swal.fire } = useSwal.fire();

  // Filtered cameras
  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         camera.class?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && camera.status === 'active') ||
                         (filterStatus === 'inactive' && camera.status !== 'active') ||
                         (filterStatus === 'online' && camera.streamStatus === 'online') ||
                         (filterStatus === 'offline' && camera.streamStatus !== 'online');
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    requestStoragePermission().then(granted => {
      if (granted) {
        console.log('Storage permission granted');
      }
    });
  }, []);

  // Fetch cameras on mount and page change
  useEffect(() => {
    fetchCameras({ page: currentPage });
  }, [currentPage]);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCameras({ page: currentPage });
      Swal.fire({
        title: "Refreshed",
        description: "Camera list updated successfully",
        variant: "success"
      });
    } catch (error) {
      Swal.fire({
        title: "Refresh Failed",
        description: error.message,
        variant: "error"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle camera activation
  const handleActivateCamera = async (cameraId) => {
    try {
      await statusToggle(cameraId);
      await fetchCameras({ page: currentPage });
      Swal.fire({
        title: "Camera Updated",
        description: "Camera status changed successfully",
        variant: "success"
      });
    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        description: error.message,
        variant: "error"
      });
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchCameras({ page: newPage });
  };

  // Handle view camera
  const handleViewCamera = (camera) => {
    setSelectedCamera(camera);
    setIsModalOpen(true);
  };

  // Handle stream toggle
  const handleStreamToggle = async (camera) => {
    try {
      if (camera.isStreaming) {
        await stopStream(camera._id);
        Swal.fire({
          title: "Stream Stopped",
          description: `${camera.name} stream stopped`,
          variant: "info"
        });
      } else {
        await startStream(camera._id);
        Swal.fire({
          title: "Stream Started",
          description: `${camera.name} stream started`,
          variant: "success"
        });
      }
      await fetchCameras({ page: currentPage });
    } catch (error) {
      Swal.fire({
        title: "Operation Failed",
        description: error.message,
        variant: "error"
      });
    }
  };

  // Stats for dashboard
  const statsData = {
    total: cameras.length,
    active: getActiveCount(),
    online: getOnlineCount(),
    offline: getOfflineCount(),
    inactive: getInactiveCount()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-8 h-8 text-blue-600" />
              Camera Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Monitor and manage all your cameras in real-time
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search cameras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 md:w-64 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-500"
              />
            </div>

            {/* View Mode */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  <List className="w-4 h-4 mr-2" />
                  List View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Grid Columns */}
            {viewMode === 'grid' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm">
                    <Grid2x2 className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setGridCols(2)}>
                    <Grid2x2 className="w-4 h-4 mr-2" />
                    2 Columns
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setGridCols(3)}>
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    3 Columns
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setGridCols(4)}>
                    <Grid2x2 className="w-4 h-4 mr-2" />
                    4 Columns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Refresh */}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="icon"
              className="bg-white/80 backdrop-blur-sm"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            {/* Fullscreen */}
            <Button
              onClick={() => document.documentElement.requestFullscreen()}
              variant="outline"
              size="icon"
              className="bg-white/80 backdrop-blur-sm"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <CameraStats stats={statsData} />

        {/* Filters */}
        <CameraFilters
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          totalCameras={filteredCameras.length}
        />

        {/* Camera Grid/List */}
        {loading && cameras.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Loading cameras...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-red-200">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 font-semibold">{error}</p>
              <Button
                onClick={handleRefresh}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredCameras.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-300">
            <Camera size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium text-lg">No cameras found</p>
            <p className="text-slate-400 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search or filters' : 'Add a camera to start monitoring'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <CameraGrid
            cameras={filteredCameras}
            cols={gridCols}
            onView={handleViewCamera}
            onActivate={handleActivateCamera}
            onStreamToggle={handleStreamToggle}
          />
        ) : (
          <CameraListView
            cameras={filteredCameras}
            onView={handleViewCamera}
            onActivate={handleActivateCamera}
            onStreamToggle={handleStreamToggle}
          />
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} cameras
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium border border-blue-200">
                {pagination.page}
              </span>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Full View Modal */}
        {isModalOpen && selectedCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-6xl bg-white rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{selectedCamera.name}</h3>
                  <p className="text-sm text-slate-500">{selectedCamera.class}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleStreamToggle(selectedCamera)}
                    variant={selectedCamera.isStreaming ? "destructive" : "default"}
                    size="sm"
                  >
                    {selectedCamera.isStreaming ? 'Stop Stream' : 'Start Stream'}
                  </Button>
                  <Button
                    onClick={() => handleActivateCamera(selectedCamera._id)}
                    variant={selectedCamera.status === "active" ? "destructive" : "default"}
                    size="sm"
                  >
                    {selectedCamera.status === "active" ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-slate-100"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              {/* Video */}
              <div className="p-4 flex-1 overflow-hidden bg-black">
                <LiveFeedVideo
                  child={selectedCamera}
                  showControls={true}
                  className="max-h-[70vh]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};