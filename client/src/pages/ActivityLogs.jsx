// pages/ActivityLogs.jsx
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

// Import components


// Import hooks
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { GuardianLogsTable } from "./activity-logs/GuardianLogsTable";
import { FailedLogsTable } from "./activity-logs/FailedLogsTable";
import { CameraDowntimeTable } from "./activity-logs/CameraDowntimeTable";
import { LogsHeader, LogsHeaderSkeleton } from "./activity-logs/LogsHeader";
import { QuickStats, QuickStatsSkeleton } from "./activity-logs/QuickStats";
import { LogTabs, LogTabsSkeleton } from "./activity-logs/LogTabs";
import { TablePagination, TablePaginationSkeleton } from "./activity-logs/TablePagination";

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

function ActivityLogsContent() {
  const [activeTab, setActiveTab] = useState("guardian");
  const [currentPage, setCurrentPage] = useState(1);
  const {
    stats,
    guardianLogs,
    failedLogs,
    cameraLogs,
    loading,
    exportToCSV,
    viewIPInfo,
  } = useActivityLogs();

  const renderTable = () => {
    switch (activeTab) {
      case "guardian":
        return <GuardianLogsTable logs={guardianLogs} />;
      case "failed":
        return <FailedLogsTable logs={failedLogs} onViewIPInfo={viewIPInfo} />;
      case "camera":
        return <CameraDowntimeTable logs={cameraLogs} />;
      default:
        return null;
    }
  };

  const totalRecords = {
    guardian: guardianLogs.length,
    failed: failedLogs.length,
    camera: cameraLogs.length,
  }[activeTab] || 0;

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        {loading ? (
          <LogsHeaderSkeleton />
        ) : (
          <LogsHeader
            title="Activity Logs"
            description="Comprehensive audit trail for security and system health"
            onExport={exportToCSV}
          />
        )}

        {/* Quick Stats */}
        {loading ? (
          <QuickStatsSkeleton />
        ) : (
          stats && <QuickStats stats={stats} />
        )}

        {/* Main Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          {loading ? (
            <LogTabsSkeleton />
          ) : (
            <LogTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}

          {/* Table Content */}
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
              </div>
            ) : (
              renderTable()
            )}
          </CardContent>

          {/* Pagination */}
          {loading ? (
            <TablePaginationSkeleton />
          ) : (
            <TablePagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalRecords / 50)}
              totalRecords={totalRecords}
              onPageChange={setCurrentPage}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

// Main Component with Error Boundary
export default function ActivityLogs() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <ActivityLogsContent />
    </ErrorBoundary>
  );
}