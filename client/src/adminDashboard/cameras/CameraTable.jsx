// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Video,
//   Edit,
//   Trash2,
//   Copy,
//   Wifi,
//   WifiOff,
//   Eye,
//   Activity,
//   Search,
// } from "lucide-react";

// /* ================= STATUS BADGE ================= */
// const StatusBadge = ({ status }) => {
//   const statusConfig = {
//     online: {
//       bg: "bg-emerald-50",
//       text: "text-emerald-600",
//       border: "border-emerald-100",
//       icon: Wifi,
//       label: "Online",
//     },
//     offline: {
//       bg: "bg-red-50",
//       text: "text-red-600",
//       border: "border-red-100",
//       icon: WifiOff,
//       label: "Offline",
//     },
//     maintenance: {
//       bg: "bg-amber-50",
//       text: "text-amber-600",
//       border: "border-amber-100",
//       icon: Activity,
//       label: "Maintenance",
//     },
//   };

//   const config = statusConfig[status] || statusConfig.offline;
//   const Icon = config.icon;

//   return (
//     <Badge
//       variant="outline"
//       className={`${config.bg} ${config.text} ${config.border} text-[10px] font-bold uppercase inline-flex items-center gap-1 border`}
//     >
//       <Icon className="w-3 h-3" />
//       {config.label}
//     </Badge>
//   );
// };

// /* ================= RTSP COPY ================= */
// const RtspUrl = ({ url }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(url);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {}
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <code className="text-[10px] bg-slate-50 px-2 py-1 rounded font-mono truncate max-w-[150px] sm:max-w-none">
//         {url}
//       </code>
//       <Button
//         variant="ghost"
//         size="icon"
//         className="h-6 w-6"
//         onClick={handleCopy}
//       >
//         <Copy className="w-3 h-3" />
//       </Button>
//     </div>
//   );
// };

// /* ================= CATEGORY ================= */
// const CategoryInfo = ({ mainCategory, subCategory }) => (
//   <div className="flex flex-col">
//     <span className="text-xs font-bold text-blue-600">{mainCategory}</span>
//     <span className="text-[10px] text-slate-400">{subCategory}</span>
//   </div>
// );

// /* ===================================================== */
// /* ================= MAIN COMPONENT ==================== */
// /* ===================================================== */

// export const CameraTable = ({
//   cameras = [],
//   onEdit,
//   onDelete,
//   onView,
//   statusToggle,
//   cameraStatus,
//   isLoading = false,
// }) => {
//   // console.log(cameras);
//   const [deleteId, setDeleteId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   // const [status, setStatus] = useState(cameraStatus || "active");
//   // console.log(cameraStatus);
//   const handleConfirmDelete = () => {
//     if (deleteId) {
//       onDelete(deleteId);
//       setDeleteId(null);
//     }
//   };

//   const filteredCameras = cameras.filter((camera) => {
//     const matchesSearch =
//       camera.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       camera.rtspUrl?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus =
//       statusFilter === "all" || camera.streamStatus === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   const onlineCount = cameras.filter((c) => c.status === "active").length;

//   if (isLoading) return <CameraTableSkeleton />;

//   if (cameras.length === 0) {
//     return (
//       <div className="p-12 text-center">
//         <Video className="w-12 h-12 mx-auto text-slate-300 mb-3" />
//         <p className="text-slate-500 font-medium">No cameras added yet.</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* ================= HEADER ================= */}
//       <div className="p-6 border-b border-slate-100 bg-slate-50/50">
//         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <div>
//             <h2 className="font-bold text-slate-800">Active Devices</h2>
//             <p className="text-xs text-emerald-600 font-semibold">
//               {onlineCount} Online
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm">
//                   Status: {statusFilter}
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 {["all", "online", "offline", "maintenance"].map((s) => (
//                   <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
//                     {s}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>

//             <div className="relative w-full md:w-64 lg:w-80">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input
//                 placeholder="Search cameras..."
//                 className="pl-10"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ================= DESKTOP TABLE ================= */}
//       <div className="hidden md:block overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Camera</TableHead>
//               <TableHead>Category</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>RTSP URL</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredCameras.map((camera) => (
//               <TableRow key={camera?.id}>
//                 <TableCell>
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
//                       <Video className="w-4 h-4 text-slate-500" />
//                     </div>
//                     <span className="font-semibold">{camera.name}</span>
//                   </div>
//                 </TableCell>

//                 <TableCell>
//                   <CategoryInfo
//                     mainCategory={camera?.mainCategoryId?.name}
//                     subCategory={camera?.subCategoryId?.name}
//                   />
//                 </TableCell>

//                 <TableCell>
//                   <button
//                     className="cursor-pointer"
//                     onClick={() => statusToggle(camera._id)}
//                   >
//                     <StatusBadge
//                       status={
//                        camera.status === "active"
//                           ? "online"
//                           : "offline"
//                       }
//                       key={camera}
//                     />
//                   </button>
//                 </TableCell>

//                 <TableCell>
//                   <RtspUrl url={camera.rtspUrl} />
//                 </TableCell>

//                 <TableCell className="text-right">
//                   <div className="flex justify-end gap-2 flex-wrap">
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       onClick={() => onView?.(camera)}
//                     >
//                       <Eye className="w-4 h-4" />
//                     </Button>
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       onClick={() => onEdit(camera)}
//                     >
//                       <Edit className="w-4 h-4" />
//                     </Button>
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       onClick={() => setDeleteId(camera._id)}
//                     >
//                       <Trash2 className="w-4 h-4 text-red-500" />
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       {/* ================= MOBILE CARD VIEW ================= */}
//       <div className="md:hidden divide-y">
//         {filteredCameras.map((camera) => (
//           <div key={camera.id} className="p-4 space-y-3">
//             <div className="flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <Video className="w-4 h-4 text-slate-500" />
//                 <span className="font-semibold text-sm">{camera.name}</span>
//               </div>
//               <StatusBadge status={camera.streamStatus} />
//             </div>

//             <CategoryInfo
//               mainCategory={camera.mainCategory}
//               subCategory={camera.subCategory}
//             />

//             <RtspUrl url={camera.rtspUrl} />

//             <div className="flex justify-end gap-2 pt-2">
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={() => onView?.(camera)}
//               >
//                 <Eye className="w-4 h-4" />
//               </Button>
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={() => onEdit(camera)}
//               >
//                 <Edit className="w-4 h-4" />
//               </Button>
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={() => setDeleteId(camera.id)}
//               >
//                 <Trash2 className="w-4 h-4 text-red-500" />
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ================= DELETE DIALOG ================= */}
//       <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleConfirmDelete}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// };

// /* ================= SKELETON ================= */
// export const CameraTableSkeleton = () => (
//   <div className="p-6 space-y-4">
//     {[...Array(4)].map((_, i) => (
//       <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
//     ))}
//   </div>
// );
// adminDashboard/cameras/CameraTable.jsx
import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Video,
  Edit,
  Trash2,
  Copy,
  Wifi,
  WifiOff,
  Eye,
  Activity,
  Search,
  Zap,
  Loader2,
  AlertCircle,
  Signal,
} from "lucide-react";

// Stream Status Badge Component
const StreamStatusBadge = memo(({ status }) => {
  const config = useMemo(() => {
    switch (status) {
      case "online":
      case "startted":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: Zap,
          label: "LIVE",
          pulse: true,
        };
      case "connecting":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: Loader2,
          label: "Connecting...",
          pulse: true,
          // spin: true,
        };
      case "error":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          icon: AlertCircle,
          label: "Error",
          pulse: false,
        };
      case "stopped":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          border: "border-gray-200",
          icon: Signal,
          label: "Stopped",
          pulse: false,
        };
      case "unknown":
      case "offline":
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-600",
          border: "border-slate-200",
          icon: WifiOff,
          label: status === "offline" ? "Offline" : "Unknown",
          pulse: false,
        };
    }
  }, [status]);

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} text-[8px] px-1.5 py-0.5 font-bold uppercase inline-flex items-center gap-1 border transition-all duration-300 ${
        config.pulse ? "animate-pulse" : ""
      } ${config.spin ? "animate-spin" : ""}`}
    >
      <Icon className={`w-2.5 h-2.5 ${config.spin ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
});

StreamStatusBadge.displayName = "StreamStatusBadge";

// Status Badge Component
const StatusBadge = memo(({ isActive }) => {
  const config = useMemo(() => {
    if (isActive) {
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-200",
        icon: Wifi,
        label: "Online",
        pulse: true,
      };
    } else {
      return {
        bg: "bg-gray-100",
        text: "text-gray-500",
        border: "border-gray-200",
        icon: Activity,
        label: "Inactive",
        pulse: false,
      };
    }
  }, [isActive]);

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} text-[10px] font-bold uppercase inline-flex items-center gap-1 border transition-all duration-300 ${
        config.pulse ? "animate-pulse" : ""
      }`}
    >
      <Icon className={`w-3 h-3 ${config.pulse ? "animate-bounce" : ""}`} />
      {config.label}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

// RTSP URL with Copy
const RtspUrl = memo(({ url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  }, [url]);

  return (
    <div className="flex items-center gap-2">
      <code className="text-[10px] bg-slate-50 px-2 py-1 rounded font-mono truncate max-w-[150px] sm:max-w-none">
        {url}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover:bg-slate-100 transition-colors"
        onClick={handleCopy}
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
  );
});

RtspUrl.displayName = "RtspUrl";

// Category Info
const CategoryInfo = memo(({ mainCategory, subCategory }) => (
  <div className="flex flex-col">
    <span className="text-xs font-bold text-blue-600">{mainCategory}</span>
    <span className="text-[10px] text-slate-400">{subCategory}</span>
  </div>
));

CategoryInfo.displayName = "CategoryInfo";

// Camera Row
const CameraRow = memo(({ camera, onEdit, onDelete, onView, statusToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const isActive = camera.status === "active";
  const streamStatus = camera.streamStatus;

  const handleToggle = useCallback(async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    const newStatus = isActive ? "inactive" : "active";
    
    try {
      await statusToggle(camera._id, newStatus);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [camera._id, isActive, statusToggle, isUpdating]);

  return (
    <tr
      className="hover:bg-slate-50/50 transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              isActive ? "bg-emerald-100" : "bg-gray-100"
            }`}
          >
            <Video
              className={`w-4 h-4 ${
                isActive ? "text-emerald-600" : "text-gray-400"
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{camera.name}</span>
            {/* Show stream status badge only if camera is active */}
            {isActive && (
              <StreamStatusBadge status={streamStatus} />
            )}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <CategoryInfo
          mainCategory={camera?.mainCategoryId?.name}
          subCategory={camera?.subCategoryId?.name}
        />
      </TableCell>

      <TableCell>
        <button
          className={`cursor-pointer hover:scale-105 transition-transform duration-200 ${
            isUpdating ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleToggle}
          disabled={isUpdating}
          title={isUpdating ? "Updating..." : "Click to toggle status"}
        >
          <StatusBadge isActive={isActive} />
        </button>
      </TableCell>

      <TableCell>
        <RtspUrl url={camera.rtspUrl} />
      </TableCell>

      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            onClick={() => onView?.(camera)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 transition-colors"
            onClick={() => onEdit(camera)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
            onClick={() => onDelete(camera._id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </tr>
  );
});

CameraRow.displayName = "CameraRow";

// Main CameraTable Component
export const CameraTable = memo(
  ({
    cameras = [],
    onEdit,
    onDelete,
    onView,
    statusToggle,
    isLoading = false,
  }) => {
    const [deleteId, setDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filter cameras
    const filteredCameras = useMemo(() => {
      return cameras.filter((camera) => {
        const matchesSearch =
          camera.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          camera.rtspUrl?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || camera.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
    }, [cameras, searchTerm, statusFilter]);

    const onlineCount = useMemo(
      () =>
        cameras.filter(
          (c) => c.status === "active" && 
          (c.streamStatus === "online" || c.streamStatus === "startted"),
        ).length,
      [cameras],
    );

    const handleConfirmDelete = useCallback(() => {
      if (deleteId) {
        onDelete(deleteId);
        setDeleteId(null);
      }
    }, [deleteId, onDelete]);

    if (isLoading) return <CameraTableSkeleton />;

    if (cameras.length === 0) {
      return (
        <div className="p-12 text-center">
          <Video className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No cameras added yet.</p>
        </div>
      );
    }

    return (
      <>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Camera Devices</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  {onlineCount} Online
                </p>
                <span className="w-px h-3 bg-slate-300"></span>
                <p className="text-xs text-slate-500">{cameras.length} Total</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="capitalize">
                    <Activity className="w-4 h-4 mr-2" />
                    {statusFilter === "all" ? "All Status" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {["all", "active", "inactive"].map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className="capitalize"
                    >
                      {s === "all" ? "All" : s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="relative w-full md:w-64 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search cameras..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Camera</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>RTSP URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCameras.map((camera) => (
                <CameraRow
                  key={camera._id || camera.id}
                  camera={camera}
                  onEdit={onEdit}
                  onDelete={(id) => setDeleteId(id)}
                  onView={onView}
                  statusToggle={statusToggle}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y">
          {filteredCameras.map((camera) => (
            <div
              key={camera._id || camera.id}
              className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      camera.status === "active"
                        ? "bg-emerald-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Video
                      className={`w-4 h-4 ${
                        camera.status === "active"
                          ? "text-emerald-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <span className="font-semibold text-sm">{camera.name}</span>
                  {camera.status === "active" && (
                    <StreamStatusBadge status={camera.streamStatus} />
                  )}
                </div>
                <button onClick={() => statusToggle(camera._id)}>
                  <StatusBadge isActive={camera.status === "active"} />
                </button>
              </div>

              <CategoryInfo
                mainCategory={camera?.mainCategoryId?.name}
                subCategory={camera?.subCategoryId?.name}
              />

              <RtspUrl url={camera.rtspUrl} />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onView?.(camera)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => onEdit(camera)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => setDeleteId(camera._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                camera.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  },
);

CameraTable.displayName = "CameraTable";

// Skeleton Loader
export const CameraTableSkeleton = memo(() => (
  <div className="p-6 space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
    ))}
  </div>
));

CameraTableSkeleton.displayName = "CameraTableSkeleton";