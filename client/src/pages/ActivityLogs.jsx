// // pages/ActivityLogs.jsx
// import React, { useState } from "react";
// import { ErrorBoundary } from "react-error-boundary";
// import { Card, CardContent } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { AlertCircle, RefreshCw } from "lucide-react";

// // Import components

// // Import hooks
// import { useActivityLogs } from "@/hooks/useActivityLogs";
// import { GuardianLogsTable } from "./activity-logs/GuardianLogsTable";
// import { FailedLogsTable } from "./activity-logs/FailedLogsTable";
// import { CameraDowntimeTable } from "./activity-logs/CameraDowntimeTable";
// import { LogsHeader, LogsHeaderSkeleton } from "./activity-logs/LogsHeader";
// import { QuickStats, QuickStatsSkeleton } from "./activity-logs/QuickStats";
// import { LogTabs, LogTabsSkeleton } from "./activity-logs/LogTabs";
// import { TablePagination, TablePaginationSkeleton } from "./activity-logs/TablePagination";

// // Error Fallback Component
// const ErrorFallback = ({ error, resetErrorBoundary }) => (
//   <div className="min-h-screen flex items-center justify-center p-4">
//     <Alert variant="destructive" className="max-w-lg">
//       <AlertCircle className="h-4 w-4" />
//       <AlertTitle>Something went wrong</AlertTitle>
//       <AlertDescription className="mt-2">{error.message}</AlertDescription>
//       <Button onClick={resetErrorBoundary} className="mt-4">
//         <RefreshCw className="w-4 h-4 mr-2" /> Try again
//       </Button>
//     </Alert>
//   </div>
// );

// function ActivityLogsContent() {
//   const [activeTab, setActiveTab] = useState("guardian");
//   const [currentPage, setCurrentPage] = useState(1);
//   const {
//     stats,
//     guardianLogs,
//     failedLogs,
//     cameraLogs,
//     loading,
//     exportToCSV,
//     viewIPInfo,
//   } = useActivityLogs();

//   const renderTable = () => {
//     switch (activeTab) {
//       case "guardian":
//         return <GuardianLogsTable logs={guardianLogs} />;
//       case "failed":
//         return <FailedLogsTable logs={failedLogs} onViewIPInfo={viewIPInfo} />;
//       case "camera":
//         return <CameraDowntimeTable logs={cameraLogs} />;
//       default:
//         return null;
//     }
//   };

//   const totalRecords = {
//     guardian: guardianLogs.length,
//     failed: failedLogs.length,
//     camera: cameraLogs.length,
//   }[activeTab] || 0;

//   return (
//     <div className="bg-slate-50 min-h-screen p-4 md:p-8">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header */}
//         {loading ? (
//           <LogsHeaderSkeleton />
//         ) : (
//           <LogsHeader
//             title="Activity Logs"
//             description="Comprehensive audit trail for security and system health"
//             onExport={exportToCSV}
//           />
//         )}

//         {/* Quick Stats */}
//         {loading ? (
//           <QuickStatsSkeleton />
//         ) : (
//           stats && <QuickStats stats={stats} />
//         )}

//         {/* Main Card */}
//         <Card className="border-slate-200 shadow-sm overflow-hidden">
//           {/* Tabs */}
//           {loading ? (
//             <LogTabsSkeleton />
//           ) : (
//             <LogTabs
//               activeTab={activeTab}
//               onTabChange={setActiveTab}
//             />
//           )}

//           {/* Table Content */}
//           <CardContent className="p-0">
//             {loading ? (
//               <div className="p-8 space-y-4">
//                 <div className="h-10 bg-slate-200 rounded animate-pulse" />
//                 <div className="h-10 bg-slate-200 rounded animate-pulse" />
//                 <div className="h-10 bg-slate-200 rounded animate-pulse" />
//               </div>
//             ) : (
//               renderTable()
//             )}
//           </CardContent>

//           {/* Pagination */}
//           {loading ? (
//             <TablePaginationSkeleton />
//           ) : (
//             <TablePagination
//               currentPage={currentPage}
//               totalPages={Math.ceil(totalRecords / 50)}
//               totalRecords={totalRecords}
//               onPageChange={setCurrentPage}
//             />
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }

// // Main Component with Error Boundary
// export default function ActivityLogs() {
//   return (
//     <ErrorBoundary
//       FallbackComponent={ErrorFallback}
//       onReset={() => window.location.reload()}
//     >
//       <ActivityLogsContent />
//     </ErrorBoundary>
//   );
// }

// pages/ActivityLogs.jsx
import React, { useState, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";

// Import components
import { GuardianLogsTable } from "./activity-logs/GuardianLogsTable";
import { FailedLogsTable } from "./activity-logs/FailedLogsTable";
import { CameraDowntimeTable } from "./activity-logs/CameraDowntimeTable";
import { LogsHeader, LogsHeaderSkeleton } from "./activity-logs/LogsHeader";
import { QuickStats, QuickStatsSkeleton } from "./activity-logs/QuickStats";
import { LogTabs, LogTabsSkeleton } from "./activity-logs/LogTabs";
import {
  TablePagination,
  TablePaginationSkeleton,
} from "./activity-logs/TablePagination";

// Import hooks
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ActivityTable } from "@/adminDashboard/dashboard/ActivityTable";

// Real-time status indicator
const ConnectionStatus = ({ isConnected }) => (
  <div
    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
      isConnected
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {isConnected ? (
      <>
        <Wifi className="w-3 h-3" />
        <span>Live</span>
      </>
    ) : (
      <>
        <WifiOff className="w-3 h-3" />
        <span>Reconnecting...</span>
      </>
    )}
  </div>
);

// Real-time updates badge
const UpdateBadge = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium animate-pulse">
      <Clock className="w-3 h-3" />
      <span>
        {count} new update{count > 1 ? "s" : ""}
      </span>
    </div>
  );
};

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
  const [newUpdates, setNewUpdates] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  const {
    stats,
    guardianLogs,
    failedLogs,
    cameraLogs,
    loading,
    exportToCSV,
    viewIPInfo,
    refreshLogs,
    isPolling,
  } = useActivityLogs();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    // Initial connection check
    setIsConnected(navigator.onLine);

    // Handle online/offline events
    const handleOnline = () => {
      setIsConnected(true);
      refreshLogs();
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const handleAutoRefresh = async () => {
      try {
        const newLogs = await refreshLogs();

        if (newLogs && newLogs.length > 0) {
          setNewUpdates((prev) => prev + newLogs.length);

          // Auto-dismiss updates after 10 seconds
          setTimeout(() => {
            setNewUpdates(0);
          }, 10000);
        }
      } catch (error) {
        console.error("Auto-refresh failed:", error);
        setIsConnected(false);

        // Try to reconnect
        setTimeout(() => {
          setIsConnected(true);
        }, 5000);
      }
    };
    // Start polling for updates
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();

      // Only check for updates every 30 seconds
      if (now - lastUpdateRef.current >= 30000) {
        handleAutoRefresh();
        lastUpdateRef.current = now;
      }
    }, 5000); // Check every 5 seconds but only refresh every 30

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshLogs]);

  // Handle auto-refresh

  // Manual refresh
  const handleManualRefresh = async () => {
    setNewUpdates(0);
    await refreshLogs();
    lastUpdateRef.current = Date.now();
  };

  // Handle tab change - clear new updates for that tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setNewUpdates(0);
  };

  const renderTable = () => {
    const logs =
      {
        guardian: guardianLogs,
        failed: failedLogs,
        camera: cameraLogs,
      }[activeTab] || [];

    // Add new update indicator
    if (newUpdates > 0 && activeTab === "guardian") {
      // You can show a notification or highlight new rows
    }

    switch (activeTab) {
      case "guardian":
        return (
          <GuardianLogsTable logs={guardianLogs} newUpdates={newUpdates} />
        );
      case "failed":
        return (
          <FailedLogsTable
            logs={failedLogs}
            onViewIPInfo={viewIPInfo}
            newUpdates={newUpdates}
          />
        );
      case "camera":
        return (
          <CameraDowntimeTable logs={cameraLogs} newUpdates={newUpdates} />
        );
      default:
        return null;
    }
  };

  const totalRecords =
    {
      guardian: guardianLogs.length,
      failed: failedLogs.length,
      camera: cameraLogs.length,
    }[activeTab] || 0;

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Real-time Status */}
        {loading ? (
          <LogsHeaderSkeleton />
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <LogsHeader
              title="Activity Logs"
              description="Comprehensive audit trail for security and system health"
              onExport={exportToCSV}
            />
            <div className="flex items-center gap-3">
              <UpdateBadge count={newUpdates} />
              <ConnectionStatus isConnected={isConnected} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isPolling}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isPolling ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isPolling ? "Refreshing..." : "Refresh"}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats with Real-time Updates */}
        {loading ? (
          <QuickStatsSkeleton />
        ) : (
          stats && <QuickStats stats={stats} newUpdates={newUpdates} />
        )}

        {/* Main Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs with Update Indicators */}
          {loading ? (
            <LogTabsSkeleton />
          ) : (
            <div className="border-b border-slate-200">
              <div className="flex items-center justify-between px-6">
                <LogTabs activeTab={activeTab} onTabChange={handleTabChange} />
                {newUpdates > 0 && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                    {newUpdates} new
                  </span>
                )}
              </div>
            </div>
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

          {/* Pagination with Auto-refresh Status */}
          {loading ? (
            <TablePaginationSkeleton />
          ) : (
            <div className="border-t border-slate-200">
              <TablePagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalRecords / 50)}
                totalRecords={totalRecords}
                onPageChange={setCurrentPage}
              />
              {isPolling && (
                <div className="px-6 py-2 text-xs text-slate-400 flex items-center gap-2 border-t border-slate-100">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating in real-time...
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Main Component with Error Boundary
export default function ActivityLogs() {
  const { data } = useDashboardData();
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <section>
        <ActivityTable
          activities={data?.activities}
          onViewAll={() => console.log("View all activities")}
        />
      </section>
    </ErrorBoundary>
  );
}
