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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Calendar,
  Fingerprint,
  Shield,
  ShieldOff,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  RefreshCw,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  History,
  Activity,
} from "lucide-react";

// Device icon mapping
const getDeviceIcon = (deviceInfo) => {
  const device = deviceInfo?.toLowerCase() || "";
  if (device.includes("mobile") || device.includes("phone") || device.includes("iphone") || device.includes("android")) 
    return Smartphone;
  if (device.includes("tablet") || device.includes("ipad")) 
    return Tablet;
  if (device.includes("laptop") || device.includes("macbook") || device.includes("notebook")) 
    return Laptop;
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

// Get device security level
const getSecurityLevel = (device) => {
  if (device.isTrusted === false) return "untrusted";
  if (device.lastUsedAt) {
    const daysSinceUse = (new Date() - new Date(device.lastUsedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceUse > 90) return "expired";
    if (daysSinceUse > 30) return "warning";
  }
  return "trusted";
};

// Device Card Component
const DeviceCard = ({ device, onRevoke, onTrust, onViewDetails }) => {
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  
  const DeviceIcon = getDeviceIcon(device.deviceInfo);
  const securityLevel = getSecurityLevel(device);
  
  const securityConfig = {
    trusted: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: Shield,
      label: "Trusted",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      icon: AlertTriangle,
      label: "Inactive",
    },
    expired: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      icon: Clock,
      label: "Expired",
    },
    untrusted: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: ShieldOff,
      label: "Untrusted",
    },
  };

  const config = securityConfig[securityLevel];
  const SecurityIcon = config.icon;

  return (
    <>
      <div className={`border rounded-lg p-4 ${config.border} ${config.bg} hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center`}>
              <DeviceIcon className={`w-5 h-5 ${config.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{device.deviceName || device.deviceInfo || "Unknown Device"}</h4>
                <Badge className={`${config.bg} ${config.text} ${config.border} border text-[10px]`}>
                  <SecurityIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {device.browserInfo || "Unknown Browser"} • {device.osInfo || "Unknown OS"}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {device.ipAddress || "Unknown IP"}
                </span>
                {device.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {[device.location.city, device.location.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewDetails?.(device)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View details</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {securityLevel === "untrusted" ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onTrust?.(device.deviceId)}
                    >
                      <Shield className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Trust this device</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowRevokeDialog(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Revoke access</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
          <div>
            <p className="text-[10px] text-slate-400">First Used</p>
            <p className="text-xs font-medium">{formatDateTime(device.firstUsedAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Last Active</p>
            <p className="text-xs font-medium">{getRelativeTime(device.lastUsedAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Total Logins</p>
            <p className="text-xs font-medium">{device.loginCount || 1} sessions</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Device ID</p>
            <p className="text-xs font-mono text-slate-500 truncate" title={device.deviceId}>
              {device.deviceId?.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Device Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke access for this device? 
              The user will be logged out and will need to verify again to regain access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRevoke(device.deviceId);
                setShowRevokeDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Device History Table Row
const DeviceHistoryRow = ({ attempt, onSelect }) => {
  const DeviceIcon = getDeviceIcon(attempt.deviceInfo);
  
  return (
    <TableRow className="hover:bg-slate-50 cursor-pointer" onClick={() => onSelect?.(attempt)}>
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
                {[attempt.location.city, attempt.location.country].filter(Boolean).join(", ")}
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
            <span className="text-xs text-slate-500">{getRelativeTime(attempt.timestamp)}</span>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge className={attempt.status === "success" 
          ? "bg-green-100 text-green-700 border-green-200" 
          : "bg-red-100 text-red-700 border-red-200"
        }>
          {attempt.status === "success" ? (
            <CheckCircle2 className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {attempt.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

// Main Component
export const DeviceHistoryDialog = ({
  open,
  onOpenChange,
  guardian,
  devices = [],
  loginHistory = [],
  onRevokeDevice,
  onTrustDevice,
  onRefresh,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("devices");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = searchTerm === "" || 
      device.deviceInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ipAddress?.includes(searchTerm) ||
      device.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "trusted" && getSecurityLevel(device) === "trusted") ||
      (statusFilter === "inactive" && getSecurityLevel(device) === "warning") ||
      (statusFilter === "expired" && getSecurityLevel(device) === "expired") ||
      (statusFilter === "untrusted" && getSecurityLevel(device) === "untrusted");

    return matchesSearch && matchesStatus;
  });

  // Filter login history
  const filteredHistory = loginHistory.filter(attempt => {
    const matchesSearch = searchTerm === "" ||
      attempt.deviceInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.ipAddress?.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || attempt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const paginatedDevices = filteredDevices.slice(
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

  // Handle device revoke
  const handleRevoke = (deviceId) => {
    onRevokeDevice?.(deviceId);
  };

  // Handle device trust
  const handleTrust = (deviceId) => {
    onTrustDevice?.(deviceId);
  };

  // Handle view device details
  const handleViewDetails = (device) => {
    setSelectedDevice(device);
    setShowDeviceDetails(true);
  };

  // Get device statistics
  const deviceStats = {
    total: devices.length,
    trusted: devices.filter(d => getSecurityLevel(d) === "trusted").length,
    inactive: devices.filter(d => getSecurityLevel(d) === "warning").length,
    expired: devices.filter(d => getSecurityLevel(d) === "expired").length,
    untrusted: devices.filter(d => getSecurityLevel(d) === "untrusted").length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span>Device Management</span>
              <p className="text-sm font-normal text-slate-500">
                {guardian?.guardianName || guardian?.name}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Manage trusted devices and view login history
          </DialogDescription>
        </DialogHeader>

        {/* Guardian Info Card */}
        {guardian && (
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-100 text-purple-700">
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

        {/* Device Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Total Devices</p>
            <p className="text-xl font-bold">{deviceStats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 mb-1">Trusted</p>
            <p className="text-xl font-bold text-green-700">{deviceStats.trusted}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-yellow-600 mb-1">Inactive</p>
            <p className="text-xl font-bold text-yellow-700">{deviceStats.inactive}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-600 mb-1">Expired</p>
            <p className="text-xl font-bold text-orange-700">{deviceStats.expired}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-600 mb-1">Untrusted</p>
            <p className="text-xl font-bold text-red-700">{deviceStats.untrusted}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Trusted Devices ({devices.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Login History ({loginHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Device Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="trusted">Trusted Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="expired">Expired Only</SelectItem>
                  <SelectItem value="untrusted">Untrusted Only</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(v) => setItemsPerPage(parseInt(v))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 / page</SelectItem>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 gap-4">
              {paginatedDevices.length > 0 ? (
                paginatedDevices.map((device, index) => (
                  <DeviceCard
                    key={index}
                    device={device}
                    onRevoke={handleRevoke}
                    onTrust={handleTrust}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <Smartphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No devices found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchTerm ? "Try adjusting your filters" : "No devices have been used yet"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredDevices.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500">
                  Showing {paginatedDevices.length} of {filteredDevices.length} devices
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
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Device & Browser</TableHead>
                    <TableHead>IP & Location</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.slice(0, 10).map((attempt, index) => (
                      <DeviceHistoryRow
                        key={index}
                        attempt={attempt}
                        onSelect={handleViewDetails}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <History className="w-8 h-8 text-slate-300" />
                          <p className="text-slate-500">No login history found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Device Details Dialog */}
        <Dialog open={showDeviceDetails} onOpenChange={setShowDeviceDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Device Details</DialogTitle>
            </DialogHeader>
            {selectedDevice && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    {React.createElement(getDeviceIcon(selectedDevice.deviceInfo), {
                      className: "w-6 h-6 text-purple-600"
                    })}
                  </div>
                  <div>
                    <h4 className="font-bold">{selectedDevice.deviceName || selectedDevice.deviceInfo}</h4>
                    <p className="text-xs text-slate-500">ID: {selectedDevice.deviceId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Browser</p>
                    <p className="text-sm">{selectedDevice.browserInfo || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Operating System</p>
                    <p className="text-sm">{selectedDevice.osInfo || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">IP Address</p>
                    <p className="text-sm font-mono">{selectedDevice.ipAddress || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="text-sm">
                      {selectedDevice.location 
                        ? `${selectedDevice.location.city || ''}, ${selectedDevice.location.country || ''}`
                        : "Unknown"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">First Used</p>
                    <p className="text-sm">{formatDateTime(selectedDevice.firstUsedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Last Active</p>
                    <p className="text-sm">{getRelativeTime(selectedDevice.lastUsedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Logins</p>
                    <p className="text-sm">{selectedDevice.loginCount || 1} sessions</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <Badge className={getSecurityLevel(selectedDevice) === "trusted"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                    }>
                      {getSecurityLevel(selectedDevice)}
                    </Badge>
                  </div>
                </div>

                {selectedDevice.lastLoginAt && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-800 font-medium mb-1">Last Login Session</p>
                    <p className="text-xs text-blue-600">
                      {formatDateTime(selectedDevice.lastLoginAt)}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeviceDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
export const DeviceHistoryDialogSkeleton = () => (
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
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="h-10 bg-slate-200 rounded animate-pulse" />

        {/* Filters Skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-slate-200 rounded animate-pulse" />
          <div className="w-[150px] h-10 bg-slate-200 rounded animate-pulse" />
          <div className="w-[120px] h-10 bg-slate-200 rounded animate-pulse" />
          <div className="w-10 h-10 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Devices Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);