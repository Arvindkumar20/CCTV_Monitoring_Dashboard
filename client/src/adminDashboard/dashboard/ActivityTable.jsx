import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Camera,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Trash2,
  FileText,
  Activity,
  Users,
  FolderTree,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

// Status badge classes
const statusConfig = {
  success: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle,
    label: "Success"
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: AlertCircle,
    label: "Warning"
  },
  error: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
    label: "Error"
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Activity,
    label: "Info"
  }
};

// Type icons mapping
const typeIcons = {
  guardian: Users,
  camera: Camera,
  category: FolderTree,
  system: Shield,
  user: User
};

// Type colors mapping
const typeColors = {
  guardian: "purple",
  camera: "emerald",
  category: "amber",
  system: "slate",
  user: "blue"
};

// Format timestamp to relative time
const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format full date
const formatFullDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const ActivityTable = ({ 
  activities = [], 
  onViewAll,
  onRefresh,
  onExport,
  onDelete,
  onViewDetails,
  isLoading = false,
  pagination = { page: 1, limit: 10, total: 0, pages: 1 }
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = typeFilter === "all" || activity.type === typeFilter;

      // Status filter
      const matchesStatus = statusFilter === "all" || activity.status === statusFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        
        if (dateFilter === "today") {
          matchesDate = activityDate.toDateString() === now.toDateString();
        } else if (dateFilter === "yesterday") {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = activityDate.toDateString() === yesterday.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = activityDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = activityDate >= monthAgo;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [activities, searchTerm, typeFilter, statusFilter, dateFilter]);

  // Pagination
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredActivities.slice(start, end);
  }, [filteredActivities, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedActivities.length === paginatedActivities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(paginatedActivities.map(a => a.id));
    }
  };

  // Handle select one
  const handleSelectOne = (id) => {
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  // Get status config
  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.info;
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const Icon = typeIcons[type] || Activity;
    return Icon;
  };

  // Get type color
  const getTypeColor = (type) => {
    return typeColors[type] || "slate";
  };

  if (isLoading) {
    return <ActivityTableSkeleton />;
  }

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="font-bold text-slate-800">Recent Activity</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredActivities.length} activities • Last updated {formatRelativeTime(new Date())}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input - Mobile/Desktop responsive */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 h-9 text-sm w-full"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 w-9 ${showFilters ? 'bg-slate-100' : ''}`}
          >
            <Filter className="w-4 h-4" />
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="h-9 w-9"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* Export Button */}
          {onExport && (
            <Button
              variant="outline"
              size="icon"
              onClick={onExport}
              className="h-9 w-9"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}

          {/* View All Button */}
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 h-9 px-3"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Type Filter */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Activity Type
            </label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="camera">Camera</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Date Range
            </label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Per Page */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Show
            </label>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(v) => setItemsPerPage(parseInt(v))}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedActivities.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">{selectedActivities.length}</span> activities selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedActivities([])}
              className="text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100"
            >
              Clear
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(selectedActivities)}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-8">
                <input
                  type="checkbox"
                  checked={selectedActivities.length === paginatedActivities.length && paginatedActivities.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300"
                />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase">Activity</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase">User</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Time</TableHead>
              <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
              {/* <TableHead className="text-xs font-semibold uppercase text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedActivities.length > 0 ? (
              paginatedActivities.map((activity) => {
                const StatusIcon = getStatusConfig(activity.status).icon;
                const TypeIcon = getTypeIcon(activity.type);
                const typeColor = getTypeColor(activity.type);
                const statusConfig_ = getStatusConfig(activity.status);

                return (
                  <TableRow key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity.id)}
                        onChange={() => handleSelectOne(activity.id)}
                        className="rounded border-slate-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-${typeColor}-100 rounded-lg flex items-center justify-center`}>
                          <TypeIcon className={`w-4 h-4 text-${typeColor}-600`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-800">{activity.action}</p>
                          <p className="text-xs text-slate-500">{activity.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize border-${typeColor}-200 text-${typeColor}-700`}>
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600">{activity.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600" title={formatFullDate(activity.timestamp)}>
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig_.bg} ${statusConfig_.text} ${statusConfig_.border} gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig_.label}
                      </Badge>
                    </TableCell>
                    {/* <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails?.(activity)}>
                            <Eye className="w-3 h-3 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="w-3 h-3 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete?.([activity.id])}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell> */}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="w-12 h-12 text-slate-300" />
                    <p className="text-slate-500 font-medium">No activities found</p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your filters or search term
                    </p>
                    <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Reset Filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {paginatedActivities.length > 0 ? (
          paginatedActivities.map((activity) => {
            const StatusIcon = getStatusConfig(activity.status).icon;
            const TypeIcon = getTypeIcon(activity.type);
            const statusConfig_ = getStatusConfig(activity.status);

            return (
              <div key={activity.id} className="p-4 space-y-3 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(activity.id)}
                      onChange={() => handleSelectOne(activity.id)}
                      className="rounded border-slate-300 mt-1"
                    />
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.description}</p>
                    </div>
                  </div>
                  <Badge className={`${statusConfig_.bg} ${statusConfig_.text} text-[10px]`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig_.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <User className="w-3 h-3" />
                    {activity.user}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Badge variant="outline" className="text-[10px]">
                      {activity.type}
                    </Badge>
                  </div>
                </div>

                {/* <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-red-600"
                      onClick={() => onDelete([activity.id])}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div> */}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No activities found</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredActivities.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredActivities.length)}
            </span>{' '}
            of <span className="font-medium">{filteredActivities.length}</span> activities
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Activity Table Skeleton
export const ActivityTableSkeleton = () => (
  <Card className="border-slate-200 shadow-sm">
    <CardHeader className="p-6 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-slate-200 rounded mt-1 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-9 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-9 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </CardHeader>
    <div className="divide-y divide-slate-100">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-slate-200 rounded mt-1 animate-pulse" />
          </div>
          <div className="w-20 h-6 bg-slate-200 rounded animate-pulse" />
          <div className="w-24 h-6 bg-slate-200 rounded animate-pulse" />
          <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </Card>
);