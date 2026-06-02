import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Download, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGuardians } from "@/hooks/useGuardians";
import {
  GuardianHeader,
  GuardianHeaderSkeleton,
} from "@/adminDashboard/guardian/GuardianHeader";
import {
  GuardianTable,
  GuardianTableSkeleton,
} from "@/adminDashboard/guardian/GuardianTable";
import AddGuardian from "@/adminDashboard/guardian/AddGuardian";
import AdminLayout from "@/components/layout/AdminLayout";
import { GuardianFilters } from "@/adminDashboard/guardian/GuardianFilters";
import { LoginHistoryDialog } from "@/adminDashboard/guardian/LoginHistoryDialog";
import { DeviceHistoryDialog } from "@/adminDashboard/guardian/DeviceHistoryDialog";
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

function GuardianManagementContent() {
  const {
    // Data
    guardians,
    loading,
    isSubmitting,
    pagination,
    stats,
    filters,

    // CRUD Operations
    addGuardian,
    editGuardian,
    removeGuardian,
    resetPassword,
    toggleStatus,
    unlockAccount,

    // Login & Device History
    getLoginHistory,
    getDeviceHistory,
    revokeDevice,

    // Export
    exportGuardians,
    // upload
    importFromFile,
    // Filter & Pagination
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,

    // Helper functions
    getActiveCount,
    getInactiveCount,
    getPendingCount,
    getLockedCount,
    getSuspendedCount,
  } = useGuardians();
  const { mainCategories, subCategories, nestedSubCategories } =
    useNestedSubCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [viewingGuardian, setViewingGuardian] = useState(null);
  const [showLoginHistory, setShowLoginHistory] = useState(null);
  const [showDeviceHistory, setShowDeviceHistory] = useState(null);
  const [selectedGuardians, setSelectedGuardians] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    // Initial load is handled by the hook
  }, []);

  const handleAddClick = () => {
    setEditingGuardian(null);
    setIsFormOpen(true);
  };

  const handleEdit = (guardian) => {
    setEditingGuardian(guardian);
    setIsFormOpen(true);
  };

  const handleView = (guardian) => {
    console.log(guardian);
    setViewingGuardian(guardian);
  };

  const handleDelete = async (id) => {
    await removeGuardian(id);
  };

  const handleResetPassword = async (id, password) => {
    await resetPassword(id, password);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await toggleStatus(id, newStatus);
  };

  const handleUnlockAccount = async (id) => {
    await unlockAccount(id);
  };

  const handleViewLoginHistory = async (guardian) => {
    const history = await getLoginHistory(guardian._id || guardian.id);
    setShowLoginHistory({ guardian, history });
  };

  const handleViewDeviceHistory = async (guardian) => {
    const devices = await getDeviceHistory(guardian._id || guardian.id);
    setShowDeviceHistory({ guardian, devices });
  };

  const handleRevokeDevice = async (guardianId, deviceId) => {
    await revokeDevice(guardianId, deviceId);
    // Refresh device history
    if (showDeviceHistory) {
      const devices = await getDeviceHistory(guardianId);
      setShowDeviceHistory({ ...showDeviceHistory, devices });
    }
  };

  const handleFormSubmit = async (data) => {
    let success;
    if (editingGuardian) {
      success = await editGuardian(
        editingGuardian._id || editingGuardian.id,
        data,
      );
    } else {
      success = await addGuardian(data);
    }
    if (success) {
      setIsFormOpen(false);
      setEditingGuardian(null);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingGuardian(null);
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedGuardians.length === guardians.length) {
      setSelectedGuardians([]);
    } else {
      setSelectedGuardians(guardians.map((g) => g._id || g.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedGuardians((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id],
    );
  };

  // Export handlers
  const handleExport = async (format = "csv") => {
    await exportGuardians(format, filters);
  };

  // Filter handlers
  const handleStatusFilter = (status) => {
    updateFilters({ status });
    changePage(1);
  };

  const handleClassFilter = (className) => {
    updateFilters({ class: className });
    changePage(1);
  };

  const handleSectionFilter = (section) => {
    updateFilters({ section });
    changePage(1);
  };

  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
    changePage(1);
  };

  console.log(mainCategories);

  // Prepare stats for header
  const guardianStats = {
    total: stats?.total || guardians.length,
    active: getActiveCount(),
    inactive: getInactiveCount(),
    pending: getPendingCount(),
    locked: getLockedCount(),
    suspended: getSuspendedCount(),
  };

  const handleTrustDevice = async (guardianId, deviceId) => {
    // Implement trust device API call
    console.log("Trust device:", deviceId);
  };

  const handleFileUpload = async (selectedFile) => {
    console.log(selectedFile);
    await importFromFile(selectedFile);
  };

  return (
    <AdminLayout>
      <div className="bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Stats */}
          {loading ? (
            <GuardianHeaderSkeleton />
          ) : (
            <GuardianHeader
              title="Guardian Management"
              description="Manage parent access and student linkages"
              stats={guardianStats}
              onAddClick={handleAddClick}
              onExport={handleExport}
              onSearch={handleSearch}
              onFilterClick={() => setShowFilters(!showFilters)}
              selectedCount={selectedGuardians.length}
              totalCount={guardians.length}
              onFileUpload={handleFileUpload}
              isUploading={isSubmitting}
            />
          )}
          {/* Filters */}
          {showFilters && (
            <GuardianFilters
              filters={filters}
              onStatusChange={handleStatusFilter}
              onClassChange={handleClassFilter}
              onSectionChange={handleSectionFilter}
              onReset={resetFilters}
            />
          )}
          {/* Guardian Table Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <GuardianTableSkeleton />
              ) : (
                <GuardianTable
                  guardians={guardians}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  onResetPassword={handleResetPassword}
                  onToggleStatus={handleToggleStatus}
                  onUnlockAccount={handleUnlockAccount}
                  onViewLoginHistory={handleViewLoginHistory}
                  onViewDeviceHistory={handleViewDeviceHistory}
                  onSelectOne={handleSelectOne}
                  onSelectAll={handleSelectAll}
                  selectedGuardians={selectedGuardians}
                  pagination={pagination}
                  onPageChange={changePage}
                  onLimitChange={changeLimit}
                />
              )}
            </CardContent>
          </Card>
          {/* Add/Edit Guardian Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {editingGuardian ? "Edit Guardian" : "Add New Guardian"}
                </DialogTitle>
              </DialogHeader>

              <AddGuardian
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                initialData={editingGuardian}
                onCancel={handleFormCancel}
                mainCategories={mainCategories}
                subCategories={subCategories}
                nestedSubCategories={nestedSubCategories}
              />
            </DialogContent>
          </Dialog>
          {/* View Guardian Dialog */}
          <Dialog
            open={!!viewingGuardian}
            onOpenChange={() => setViewingGuardian(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Guardian Details
                </DialogTitle>
              </DialogHeader>
              {viewingGuardian && (
                <div className="space-y-4">
                  {/* Guardian details rendering */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <span className="text-lg font-bold">
                        {viewingGuardian.guardianName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold">
                        {viewingGuardian.guardianName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {viewingGuardian.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Mobile</p>
                      <p className="font-medium">{viewingGuardian.mobile}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <p
                        className={`font-medium ${
                          viewingGuardian.status === "active"
                            ? "text-green-600"
                            : viewingGuardian.status === "locked"
                              ? "text-red-600"
                              : viewingGuardian.status === "pending"
                                ? "text-amber-600"
                                : "text-slate-600"
                        }`}
                      >
                        {viewingGuardian.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Student</p>
                      <p className="font-medium">
                        {viewingGuardian.studentName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Class/Section</p>
                      <p className="font-medium">
                        {viewingGuardian.className} -{" "}
                        {viewingGuardian.sectionName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Last Login</p>
                      <p className="font-medium">
                        {viewingGuardian.lastLoginAt
                          ? new Date(
                              viewingGuardian.lastLoginAt,
                            ).toLocaleString()
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          {/* Login History Dialog */}
          <LoginHistoryDialog
            open={!!showLoginHistory}
            onOpenChange={() => setShowLoginHistory(null)}
            guardian={showLoginHistory?.guardian}
            history={showLoginHistory?.history || []}
          />
          {/* Device History Dialog */}

          <DeviceHistoryDialog
            open={!!showDeviceHistory}
            onOpenChange={() => setShowDeviceHistory(null)}
            guardian={showDeviceHistory?.guardian}
            devices={showDeviceHistory?.devices || []}
            loginHistory={[]} // Pass login history if available
            onRevokeDevice={(deviceId) =>
              handleRevokeDevice(
                showDeviceHistory?.guardian._id ||
                  showDeviceHistory?.guardian.id,
                deviceId,
              )
            }
            onTrustDevice={(deviceId) =>
              handleTrustDevice(
                showDeviceHistory?.guardian._id ||
                  showDeviceHistory?.guardian.id,
                deviceId,
              )
            }
          />
        </div>
      </div>
    </AdminLayout>
  );
}

// Main Component with Error Boundary
export default function GuardianManagement() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <GuardianManagementContent />
    </ErrorBoundary>
  );
}
