import React, { useState } from "react";
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
} from "lucide-react";

/* ================= STATUS BADGE ================= */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    online: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      icon: Wifi,
      label: "Online",
    },
    offline: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      icon: WifiOff,
      label: "Offline",
    },
    maintenance: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      icon: Activity,
      label: "Maintenance",
    },
  };

  const config = statusConfig[status] || statusConfig.offline;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} text-[10px] font-bold uppercase inline-flex items-center gap-1 border`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

/* ================= RTSP COPY ================= */
const RtspUrl = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="flex items-center gap-2">
      <code className="text-[10px] bg-slate-50 px-2 py-1 rounded font-mono truncate max-w-[150px] sm:max-w-none">
        {url}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopy}
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
  );
};

/* ================= CATEGORY ================= */
const CategoryInfo = ({ mainCategory, subCategory }) => (
  <div className="flex flex-col">
    <span className="text-xs font-bold text-blue-600">
      {mainCategory}
    </span>
    <span className="text-[10px] text-slate-400">
      {subCategory}
    </span>
  </div>
);

/* ===================================================== */
/* ================= MAIN COMPONENT ==================== */
/* ===================================================== */

export const CameraTable = ({
  cameras = [],
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}) => {
  console.log(cameras)
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.rtspUrl?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || camera.streamStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const onlineCount = cameras.filter(
    (c) => c.streamStatus === "online"
  ).length;

  if (isLoading) return <CameraTableSkeleton />;

  if (cameras.length === 0) {
    return (
      <div className="p-12 text-center">
        <Video className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">
          No cameras added yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Active Devices
            </h2>
            <p className="text-xs text-emerald-600 font-semibold">
              {onlineCount} Online
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Status: {statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["all", "online", "offline", "maintenance"].map(
                  (s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => setStatusFilter(s)}
                    >
                      {s}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative w-full md:w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search cameras..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Camera</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>RTSP URL</TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCameras.map((camera) => (
              <TableRow key={camera?.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                      <Video className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-semibold">
                      {camera.name}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <CategoryInfo
                    mainCategory={camera?.mainCategoryId?.name}
                    subCategory={camera?.subCategoryId?.name}
                  />
                </TableCell>

                <TableCell>
                  <StatusBadge status={camera.streamStatus} />
                </TableCell>

                <TableCell>
                  <RtspUrl url={camera.rtspUrl} />
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 flex-wrap">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onView?.(camera)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(camera)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setDeleteId(camera._id)
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ================= MOBILE CARD VIEW ================= */}
      <div className="md:hidden divide-y">
        {filteredCameras.map((camera) => (
          <div key={camera.id} className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-sm">
                  {camera.name}
                </span>
              </div>
              <StatusBadge status={camera.streamStatus} />
            </div>

            <CategoryInfo
              mainCategory={camera.mainCategory}
              subCategory={camera.subCategory}
            />

            <RtspUrl url={camera.rtspUrl} />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onView?.(camera)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(camera)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setDeleteId(camera.id)
                }
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DELETE DIALOG ================= */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
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
};

/* ================= SKELETON ================= */
export const CameraTableSkeleton = () => (
  <div className="p-6 space-y-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="h-16 bg-slate-200 rounded animate-pulse"
      />
    ))}
  </div>
);
