// pages/CameraManagement.jsx
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Video } from "lucide-react"; // Added Video import
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

// Error Fallback Component
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

function CameraManagementContent() {
  const {
    cameras,
    loading,
    isSubmitting,
    pagination,
    stats,
    addCamera,
    editCamera,
    removeCamera,
    fetchCameras,
    getOnlineCount,
    getOfflineCount,
    getActiveCount,
    getInactiveCount,
  } = useCameras();

  const { mainCategories, subCategories, nestedSubCategories } =
    useNestedSubCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [viewingCamera, setViewingCamera] = useState(null);

  const handleAddClick = () => {
    setEditingCamera(null);
    setIsFormOpen(true);
  };

  const handleEdit = (camera) => {
    setEditingCamera(camera);
    setIsFormOpen(true);
  };

  const handleView = (camera) => {
    setViewingCamera(camera);
  };

  const handleDelete = async (id) => {
    await removeCamera(id);
  };

 // In your CameraManagement.jsx, update the handleFormSubmit:

const handleFormSubmit = async (data) => {
  let success;
  if (editingCamera) {
    // Make sure to pass the correct ID
    const cameraId = editingCamera._id || editingCamera.id;
    success = await editCamera(cameraId, data);
  } else {
    success = await addCamera(data);
  }
  if (success) {
    setIsFormOpen(false);
    setEditingCamera(null);
  }
  return success; // Return success status
};

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCamera(null);
  };

  const handlePageChange = async (newPage) => {
    await fetchCameras({ page: newPage });
  };

  const handleFilterChange = async (newFilters) => {
    await fetchCameras({ ...newFilters, page: 1 });
  };

  return (
    <AdminLayout>
      <div className="bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header with Stats */}
          {loading && !cameras.length ? (
            <CameraHeaderSkeleton />
          ) : (
            <CameraHeader
              title="Camera Management"
              description="Monitor and manage all surveillance hardware"
              onAddClick={handleAddClick}
              stats={{
                total: pagination.total || cameras.length,
                online: getOnlineCount(),
                offline: getOfflineCount(),
                active: getActiveCount(),
                inactive: getInactiveCount(),
                ...stats,
              }}
            />
          )}

          {/* Camera Table Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <CameraTableSkeleton />
              ) : (
                <CameraTable
                  cameras={cameras}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onFilterChange={handleFilterChange}
                />
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Camera Dialog */}
          {/* Add/Edit Camera Dialog */}
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
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
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
                        {viewingCamera?.mainCategoryId?.name ||
                          viewingCamera?.categoryId ||
                          "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Sub Category</p>
                      <p className="font-medium">
                        {viewingCamera?.subCategoryId?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Active</p>
                      <p className="font-medium capitalize">
                        {viewingCamera.status
                         }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <p className="font-medium">
                        {viewingCamera.streamStatus}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">RTSP URL</p>
                    <code className="text-sm bg-slate-50 p-2 rounded block break-all">
                      {viewingCamera.rtspUrl || viewingCamera.url || "N/A"}
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
}

// Main Component with Error Boundary
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
