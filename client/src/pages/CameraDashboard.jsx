
// // frontend/src/pages/CameraDashboard.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Camera,
//   RefreshCw,
//   Search,
//   Grid3x3,
//   List,
//   LayoutGrid,
// } from "lucide-react";
// import { useCameras } from "@/hooks/useCameras";
// import { CameraCard } from "@/components/CameraDashboard/CameraCard";
// import { CameraGridView } from "@/components/CameraDashboard/CameraGridView";

// export const CameraDashboard = () => {
//   const {
//     cameras,
//     loading,
//     fetchCameras,
//     statusToggle,
//     startStream,
//     stopStream,
//     getOnlineCount,
//     getActiveCount,
//   } = useCameras();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewMode, setViewMode] = useState("grid"); // grid | list | multiview
//   const [showMultiView, setShowMultiView] = useState(false);

//   const handleStreamToggle = async (camera) => {
//     try {
//       if (camera.isStreaming) {
//         await stopStream(camera._id);
//       } else {
//         await startStream(camera._id);
//       }
//     } catch (error) {
//       console.error("Failed to toggle stream:", error);
//     }
//   };

//   const filteredCameras = useMemo(() => {
//     return cameras.filter((camera) => {
//       const matchesSearch = camera.name
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase());
//       return matchesSearch;
//     });
//   }, [cameras, searchQuery]);

//   const handleRefresh = async () => {
//     await fetchCameras({ page: 1, limit: 10 });
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//             <Camera className="w-6 h-6 text-blue-600" />
//             Camera Dashboard
//           </h1>
//           <p className="text-sm text-slate-400">
//             {filteredCameras.length} cameras • {getOnlineCount()} online
//           </p>
//         </div>

//         <div className="flex items-center gap-3 flex-wrap">
//           {/* View Mode Toggle (Card | List) */}
//           <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
//             <button
//               onClick={() => setViewMode("grid")}
//               className={`p-2 rounded-lg transition ${
//                 viewMode === "grid"
//                   ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
//                   : "hover:bg-slate-100 text-slate-600"
//               }`}
//               title="Card View"
//             >
//               <Grid3x3 className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => setViewMode("list")}
//               className={`p-2 rounded-lg transition ${
//                 viewMode === "list"
//                   ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
//                   : "hover:bg-slate-100 text-slate-600"
//               }`}
//               title="List View"
//             >
//               <List className="w-4 h-4" />
//             </button>
//           </div>

//           {/* ✅ Multiview Button (NEW) */}
//           <button
//             onClick={() => setShowMultiView(true)}
//             disabled={filteredCameras.length === 0}
//             className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <LayoutGrid className="w-4 h-4" />
//             <span className="text-sm font-medium">Multi-View</span>
//           </button>

//           {/* Search */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
//             <input
//               placeholder="Search cameras..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 pr-4 py-2 w-48 md:w-64 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
//             />
//           </div>

//           {/* Refresh */}
//           <button
//             onClick={handleRefresh}
//             className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
//           >
//             <RefreshCw className="w-4 h-4 text-slate-600" />
//           </button>
//         </div>
//       </div>

//       {/* Camera Grid / List */}
//       {loading && cameras.length === 0 ? (
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="flex flex-col items-center gap-3">
//             <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-slate-400 text-sm">Loading cameras...</p>
//           </div>
//         </div>
//       ) : (
//         <div
//           className={
//             viewMode === "grid"
//               ? "grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
//               : "space-y-3"
//           }
//         >
//           {filteredCameras.map((camera) => (
//             <CameraCard
//               key={camera._id}
//               camera={camera}
//               onView={() => {}}
//               onActivate={async (id) => {
//                 await statusToggle(id);
//                 await fetchCameras();
//               }}
//               onStreamToggle={handleStreamToggle}
//               isStreamActive={camera.isStreaming}
//             />
//           ))}
//         </div>
//       )}

//       {/* Empty State */}
//       {filteredCameras.length === 0 && !loading && (
//         <div className="text-center py-12">
//           <div className="text-4xl mb-3">📹</div>
//           <p className="text-slate-500 font-medium">No cameras found</p>
//           <p className="text-slate-400 text-sm">Try adjusting your search</p>
//         </div>
//       )}

//       {/* ✅ Multi-View Overlay */}
//       {showMultiView && (
//         <CameraGridView
//           cameras={filteredCameras}
//           onClose={() => setShowMultiView(false)}
//         />
//       )}
//     </div>
//   );
// };












// frontend/src/pages/CameraDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Camera,
  RefreshCw,
  Search,
  Grid3x3,
  List,
  LayoutGrid,
} from "lucide-react";
import { useCameras } from "@/hooks/useCameras";
import { CameraCard } from "@/components/CameraDashboard/CameraCard";
import { CameraGridView } from "@/components/CameraDashboard/CameraGridView";

export const CameraDashboard = () => {
  const {
    cameras,
    loading,
    fetchCameras,
    statusToggle,
    startStream,
    stopStream,
    getOnlineCount,
    getActiveCount,
  } = useCameras();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showMultiView, setShowMultiView] = useState(false);

  // ✅ Initial fetch — triggers backend auto-start of streams
  useEffect(() => {
    fetchCameras({ page: 1, limit: 50 });
  }, [fetchCameras]);

  // ✅ Periodic refresh to update stream statuses (every 15s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCameras({ page: 1, limit: 50 }, { silent: true });
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchCameras]);

  const handleStreamToggle = useCallback(
    async (camera) => {
      try {
        if (camera.isStreaming) {
          await stopStream(camera._id);
        } else {
          await startStream(camera._id);
        }
        // Refresh to update UI
        await fetchCameras({ page: 1, limit: 50 }, { silent: true });
      } catch (error) {
        console.error("Failed to toggle stream:", error);
      }
    },
    [startStream, stopStream, fetchCameras],
  );

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [cameras, searchQuery]);

  const handleRefresh = async () => {
    await fetchCameras({ page: 1, limit: 50 });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header — same as before */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            Camera Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            {filteredCameras.length} cameras • {getOnlineCount()} online
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${
                viewMode === "list"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowMultiView(true)}
            disabled={filteredCameras.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition disabled:opacity-50"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm font-medium">Multi-View</span>
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search cameras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-48 md:w-64 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {loading && cameras.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading cameras...</p>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {filteredCameras.map((camera) => (
            <CameraCard
              key={camera._id}
              camera={camera}
              onView={() => {}}
              onActivate={async (id) => {
                await statusToggle(id);
                await fetchCameras({ page: 1, limit: 50 }, { silent: true });
              }}
              onStreamToggle={handleStreamToggle}
              isStreamActive={camera.isStreaming}
            />
          ))}
        </div>
      )}

      {filteredCameras.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📹</div>
          <p className="text-slate-500 font-medium">No cameras found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search</p>
        </div>
      )}

      {showMultiView && (
        <CameraGridView
          cameras={filteredCameras}
          onClose={() => setShowMultiView(false)}
        />
      )}
    </div>
  );
};