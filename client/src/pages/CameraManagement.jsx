// pages/CameraManagement.jsx
import { CameraDetectionSettings } from "@/adminDashboard/cameras/CameraDetectionSettings";
import { Settings } from "lucide-react"; // icon agar chahiye
import React, { useState, useCallback, memo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Video, Wifi } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCameras } from "@/hooks/useCameras";
import {
  CameraHeader,
  CameraHeaderSkeleton,
} from "@/adminDashboard/cameras/CameraHeader";
import {
  CameraTable,
  CameraTableSkeleton,
} from "@/adminDashboard/cameras/CameraTable";
import AdminLayout from "@/components/layout/AdminLayout";
import AddCamera from "@/adminDashboard/cameras/AddCamera";
import { useNestedSubCategories } from "@/hooks/useNestedCategories";

// Error Fallback
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Alert variant="destructive" className="max-w-lg">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="mt-2">{error.message}</AlertDescription>
      <Button onClick={resetErrorBoundary} className="mt-4">
        <RefreshCw className="w-4 h-4 mr-2" /> Try again
      </Button>
    </Alert>
  </div>
);

// Main Content
const CameraManagementContent = memo(() => {
  const {
    cameras,
    loading,
    isSubmitting,
    stats,
    addCamera,
    editCamera,
    removeCamera,
    fetchCameras,
    getOnlineCount,
    getOfflineCount,
    getActiveCount,
    getInactiveCount,
    statusToggle,
    refreshData,
  } = useCameras();

  const { mainCategories, subCategories, nestedSubCategories } =
    useNestedSubCategories();
  const [settingsCamera, setSettingsCamera] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [viewingCamera, setViewingCamera] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAddClick = useCallback(() => {
    setEditingCamera(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((camera) => {
    setEditingCamera(camera);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((camera) => {
    setViewingCamera(camera);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      await removeCamera(id);
    },
    [removeCamera],
  );

  const handleSettings = useCallback((camera) => {
    setSettingsCamera(camera);
  }, []);

  const handleFormSubmit = useCallback(
    async (data) => {
      let success;
      if (editingCamera) {
        const cameraId = editingCamera._id || editingCamera.id;
        success = await editCamera(cameraId, data);
      } else {
        success = await addCamera(data);
      }
      if (success) {
        setIsFormOpen(false);
        setEditingCamera(null);
      }
      return success;
    },
    [editingCamera, editCamera, addCamera],
  );

  const handleFormCancel = useCallback(() => {
    setIsFormOpen(false);
    setEditingCamera(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  }, [refreshData]);

  return (
    <AdminLayout>
      <div className="bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">Live</span>
              </span>
              <span className="w-px h-3 bg-slate-300"></span>
              <span className="text-slate-400">
                {new Date().toLocaleDateString()} •{" "}
                {new Date().toLocaleTimeString()}
              </span>
              <span className="w-px h-3 bg-slate-300"></span>
              <span className="text-slate-400">
                {cameras.length} cameras • {getOnlineCount()} online
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {/* Header with Stats */}
          {loading && !cameras.length ? (
            <CameraHeaderSkeleton />
          ) : (
            <CameraHeader
              title="Camera Management"
              description="Monitor and manage all surveillance hardware"
              onAddClick={handleAddClick}
              stats={{
                total: cameras.length,
                online: getOnlineCount(),
                offline: getOfflineCount(),
                active: getActiveCount(),
                inactive: getInactiveCount(),
                ...stats,
              }}
            />
          )}

          {/* Camera Table */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <CameraTableSkeleton />
              ) : (
                <CameraTable
                  cameras={cameras}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSettings={handleSettings}
                  onView={handleView}
                  statusToggle={statusToggle}
                  isLoading={loading}
                />
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {editingCamera ? "Edit Camera" : "Add New Camera"}
                </DialogTitle>
              </DialogHeader>

              <AddCamera
                mainCategories={mainCategories}
                subCategories={subCategories}
                nestedSubCategories={nestedSubCategories}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                initialData={editingCamera}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
          <Dialog
            open={!!settingsCamera}
            onOpenChange={() => setSettingsCamera(null)}
          >
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-600" />
                  Detection Settings
                </DialogTitle>
              </DialogHeader>
              {settingsCamera && (
                <CameraDetectionSettings
                  camera={settingsCamera}
                  onClose={() => setSettingsCamera(null)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* View Camera Dialog */}
          <Dialog
            open={!!viewingCamera}
            onOpenChange={() => setViewingCamera(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Camera Details
                </DialogTitle>
              </DialogHeader>
              {viewingCamera && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        viewingCamera.status === "active"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {viewingCamera.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        ID: {viewingCamera._id || viewingCamera.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Main Category</p>
                      <p className="font-medium">
                        {viewingCamera?.mainCategoryId?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Sub Category</p>
                      <p className="font-medium">
                        {viewingCamera?.subCategoryId?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <p className="font-medium capitalize flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            viewingCamera.status === "active"
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                          }`}
                        ></span>
                        {viewingCamera.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Stream</p>
                      <p className="font-medium capitalize flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            viewingCamera.streamStatus === "online"
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-red-400"
                          }`}
                        ></span>
                        {viewingCamera.streamStatus}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">RTSP URL</p>
                    <code className="text-sm bg-slate-50 p-2 rounded block break-all">
                      {viewingCamera.rtspUrl || "N/A"}
                    </code>
                  </div>

                  {viewingCamera.location && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Location</p>
                      <p className="text-sm">{viewingCamera.location}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminLayout>
  );
});

// Main Component
export default function CameraManagement() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <CameraManagementContent />
    </ErrorBoundary>
  );
}
