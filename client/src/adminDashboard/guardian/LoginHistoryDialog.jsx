import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Globe,
  MapPin,
  Fingerprint,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  EyeOff,
} from "lucide-react";

// Device icon mapping
const getDeviceIcon = (deviceInfo) => {
  const device = deviceInfo?.toLowerCase() || "";
  if (device.includes("mobile") || device.includes("phone")) return Smartphone;
  if (device.includes("tablet")) return Tablet;
  if (device.includes("laptop")) return Laptop;
  return Monitor;
};

// Format date
const formatDateTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// Format relative time
const getRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Status Badge Component
const StatusBadge = ({ status, failureReason }) => {
  const getStatusConfig = () => {
    if (status === "success") {
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: CheckCircle2,
        label: "Success",
      };
    }
    
    // Failed status with reason
    const reasonConfig = {
      invalid_password: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: XCircle,
        label: "Wrong Password",
      },
      account_locked: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: AlertCircle,
        label: "Account Locked",
      },
      invalid_credentials: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: XCircle,
        label: "Invalid Credentials",
      },
      account_inactive: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
        icon: EyeOff,
        label: "Account Inactive",
      },
      too_many_attempts: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: AlertCircle,
        label: "Too Many Attempts",
      },
      session_expired: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: Clock,
        label: "Session Expired",
      },
    };

    return reasonConfig[failureReason] || {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      icon: XCircle,
      label: "Failed",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={`${config.bg} ${config.text} ${config.border} gap-1`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        {failureReason && (
          <TooltipContent>
            <p className="text-xs">{failureReason.replace(/_/g, " ")}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

// Login Attempt Row Component
const LoginAttemptRow = ({ attempt }) => {
  const DeviceIcon = getDeviceIcon(attempt.deviceInfo);

  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <DeviceIcon className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="font-medium text-sm">{attempt.deviceInfo || "Unknown Device"}</p>
            <p className="text-xs text-slate-400">{attempt.browserInfo || "Unknown Browser"}</p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-mono">{attempt.ipAddress || "Unknown IP"}</span>
          </div>
          {attempt.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {[attempt.location.city, attempt.location.country]
                  .filter(Boolean)
                  .join(", ") || "Unknown Location"}
              </span>
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className="text-xs">{formatDateTime(attempt.timestamp)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">
              {getRelativeTime(attempt.timestamp)}
            </span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <StatusBadge 
          status={attempt.status} 
          failureReason={attempt.failureReason} 
        />
        {attempt.failureDetails && attempt.status === "failed" && (
          <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={attempt.failureDetails}>
            {attempt.failureDetails}
          </p>
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px]">
            {attempt.osInfo || "Unknown OS"}
          </Badge>
          {attempt.sessionId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Fingerprint className="w-3 h-3 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Session: {attempt.sessionId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

// Statistics Cards Component
const StatsCards = ({ history = [] }) => {
  const total = history.length;
  const successful = history.filter(h => h.status === "success").length;
  const failed = history.filter(h => h.status === "failed").length;
  
  const uniqueDevices = new Set(history.map(h => h.deviceInfo)).size;
  const uniqueIPs = new Set(history.map(h => h.ipAddress)).size;
  
  const last7Days = history.filter(h => {
    const date = new Date(h.timestamp);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date > weekAgo;
  }).length;

  const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-xs text-slate-500 mb-1">Total Attempts</p>
        <p className="text-xl font-bold">{total}</p>
        <p className="text-xs text-slate-400 mt-1">Last 7 days: {last7Days}</p>
      </div>
      
      <div className="bg-green-50 rounded-lg p-3">
        <p className="text-xs text-green-600 mb-1">Successful</p>
        <p className="text-xl font-bold text-green-700">{successful}</p>
        <p className="text-xs text-green-600 mt-1">{successRate}% success rate</p>
      </div>
      
      <div className="bg-red-50 rounded-lg p-3">
        <p className="text-xs text-red-600 mb-1">Failed</p>
        <p className="text-xl font-bold text-red-700">{failed}</p>
        <p className="text-xs text-red-600 mt-1">{total - successful} attempts</p>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-xs text-blue-600 mb-1">Unique</p>
        <p className="text-xl font-bold text-blue-700">{uniqueDevices}</p>
        <p className="text-xs text-blue-600 mt-1">{uniqueIPs} IP addresses</p>
      </div>
    </div>
  );
};

// Main Component
export const LoginHistoryDialog = ({
  open,
  onOpenChange,
  guardian,
  history = [],
  onRefresh,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  // Filter history
  const filteredHistory = history.filter(attempt => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      attempt.ipAddress?.includes(searchTerm) ||
      attempt.deviceInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.failureReason?.includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || attempt.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const date = new Date(attempt.timestamp);
      const now = new Date();
      const days = parseInt(dateFilter);
      if (!isNaN(days)) {
        const cutoff = new Date(now.setDate(now.getDate() - days));
        matchesDate = date >= cutoff;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "G";
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Export data
  const handleExport = () => {
    const exportData = filteredHistory.map(attempt => ({
      timestamp: formatDateTime(attempt.timestamp),
      status: attempt.status,
      failureReason: attempt.failureReason,
      ipAddress: attempt.ipAddress,
      deviceInfo: attempt.deviceInfo,
      browserInfo: attempt.browserInfo,
      osInfo: attempt.osInfo,
      location: attempt.location ? 
        `${attempt.location.city || ''}, ${attempt.location.country || ''}`.trim() : '',
      sessionId: attempt.sessionId
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `login_history_${guardian?._id || guardian?.id}_${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span>Login History</span>
              <p className="text-sm font-normal text-slate-500">
                {guardian?.guardianName || guardian?.name}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detailed login attempts and device access history
          </DialogDescription>
        </DialogHeader>

        {/* Guardian Info Card */}
        {guardian && (
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(guardian.guardianName || guardian.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Guardian Name</p>
                    <p className="font-medium">{guardian.guardianName || guardian.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Mobile</p>
                    <p className="font-medium">{guardian.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{guardian.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Student</p>
                    <p className="font-medium">{guardian.studentName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <StatsCards history={history} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by IP, device, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1">Last 24 Hours</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(v) => setItemsPerPage(parseInt(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-slate-500">
            Showing {paginatedHistory.length} of {filteredHistory.length} entries
          </p>
          {searchTerm && (
            <Badge variant="outline" className="gap-1">
              <Filter className="w-3 h-3" />
              Filtered by: "{searchTerm}"
            </Badge>
          )}
        </div>

        {/* Login History Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[250px]">Device & Browser</TableHead>
                <TableHead className="w-[200px]">IP & Location</TableHead>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px]">System Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((attempt, index) => (
                  <LoginAttemptRow 
                    key={index} 
                    attempt={attempt}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      <p className="text-slate-500">No login history found</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm ? "Try adjusting your filters" : "This guardian has not logged in yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredHistory.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Failure Analysis */}
        {history.filter(h => h.status === "failed").length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Failed Login Analysis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(
                history
                  .filter(h => h.status === "failed")
                  .reduce((acc, h) => {
                    const reason = h.failureReason || "unknown";
                    acc[reason] = (acc[reason] || 0) + 1;
                    return acc;
                  }, {})
              ).map(([reason, count]) => (
                <div key={reason} className="bg-white p-2 rounded border border-amber-100">
                  <p className="text-xs text-amber-700 capitalize">
                    {reason.replace(/_/g, " ")}
                  </p>
                  <p className="text-lg font-bold text-amber-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Skeleton Loading Component
export const LoginHistoryDialogSkeleton = () => (
  <Dialog open={true} onOpenChange={() => {}}>
    <DialogContent className="max-w-6xl">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
          <div>
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 rounded mt-1 animate-pulse" />
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-slate-200 rounded animate-pulse" />
          <div className="w-[140px] h-10 bg-slate-200 rounded animate-pulse" />
          <div className="w-[140px] h-10 bg-slate-200 rounded animate-pulse" />
          <div className="w-[100px] h-10 bg-slate-200 rounded animate-pulse" />
          <div className="w-10 h-10 bg-slate-200 rounded animate-pulse" />
          <div className="w-10 h-10 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Table Skeleton */}
        <div className="border rounded-lg">
          <div className="h-12 bg-slate-100 rounded-t-lg" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-50 border-t animate-pulse" />
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);