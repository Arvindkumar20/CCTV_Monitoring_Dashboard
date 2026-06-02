import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Key,
  Edit,
  Trash2,
  Mail,
  Phone,
  Search,
  User,
  Filter,
  Eye,
  History,
  Smartphone,
  Lock,
  Unlock,
  MoreVertical,
  Calendar,
  BookOpen,
  Users,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import ResetPasswordModal from "./ResetPasswordModal"; // Import the modal
import { showSuccessAlert } from "@/services/pop";
import { GuardianAvatar } from "./GuardianAvatar";
import { AcademicHierarchy } from "./AcademicHierarchy";
import { StatusBadge } from "./StatusBadge";
import { HierarchyTooltip } from "./ToolTip";

// ... (all your existing components: StatusBadge, GuardianAvatar, AcademicHierarchy, HierarchyTooltip remain same)

export const GuardianTable = ({
  guardians = [],
  onEdit,
  onDelete,
  onView,
  onResetPassword, // This will be the API call function
  onToggleStatus,
  onUnlockAccount,
  onViewLoginHistory,
  onViewDeviceHistory,
  onSelectOne,
  onSelectAll,
  selectedGuardians = [],
  pagination,
  onPageChange,
  onLimitChange,
  isLoading = false,
}) => {
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedGuardianForReset, setSelectedGuardianForReset] =
    useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleResetPasswordClick = (guardian) => {
    setSelectedGuardianForReset(guardian);
    setIsResetModalOpen(true);
  };

  const handlePasswordReset = async (guardianId, newPassword) => {
    try {
      await onResetPassword(guardianId, newPassword);
      showSuccessAlert("Success", "Password has been reset successfully");
      setIsResetModalOpen(false);
      setSelectedGuardianForReset(null);
    } catch (error) {
      throw new Error(error.message || "Failed to reset password");
    }
  };

  console.log(guardians);

  // Helper function to get class name from guardian data
  const getClassName = (guardian) => {
    return (
      guardian.className || guardian.Class?.name || guardian.Class || "N/A"
    );
  };

  // Helper function to get section name from guardian data
  const getSectionName = (guardian) => {
    return (
      guardian.sectionName || guardian.section?.name || guardian.section || null
    );
  };

  // Helper function to get group name from guardian data
  const getGroupName = (guardian) => {
    return guardian.groupName || guardian.group?.name || guardian.group || null;
  };

  // Filter guardians based on search and status
  const filteredGuardians = guardians.filter((guardian) => {
    const searchLower = searchTerm.toLowerCase();

    const className = getClassName(guardian);
    const sectionName = getSectionName(guardian);
    const groupName = getGroupName(guardian);

    const matchesSearch =
      !searchTerm ||
      guardian.guardianName?.toLowerCase().includes(searchLower) ||
      guardian.studentName?.toLowerCase().includes(searchLower) ||
      guardian.mobile?.includes(searchTerm) ||
      guardian.email?.toLowerCase().includes(searchLower) ||
      guardian.relationship?.toLowerCase().includes(searchLower) ||
      className?.toLowerCase().includes(searchLower) ||
      sectionName?.toLowerCase().includes(searchLower) ||
      groupName?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || guardian.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const pageSize = pagination?.limit || 10;
  const currentPage = pagination?.page || 1;
  const totalPages = Math.ceil(filteredGuardians.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGuardians = filteredGuardians.slice(
    startIndex,
    startIndex + pageSize,
  );

  // Check if all visible guardians are selected
  const allVisibleSelected =
    paginatedGuardians.length > 0 &&
    paginatedGuardians.every((g) => selectedGuardians.includes(g._id || g.id));

  // Handle select all
  const handleSelectAll = () => {
    if (allVisibleSelected) {
      onSelectAll?.([]);
    } else {
      onSelectAll?.(paginatedGuardians.map((g) => g._id || g.id));
    }
  };

  if (isLoading) {
    return <GuardianTableSkeleton />;
  }

  if (!guardians || guardians.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold text-lg mb-2">
            No guardians added yet
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Get started by adding your first guardian to manage parent access
            and communication.
          </p>
          <Button onClick={() => navigate("/dashboard/guardians/add")}>
            <User className="w-4 h-4" />
            Add Guardian
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Title and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-slate-800">Guardians</h2>
              <Badge variant="secondary" className="rounded-full">
                {filteredGuardians.length} / {guardians?.length}
              </Badge>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 w-8 p-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, student, phone, email, class, section..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[130px] justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      {statusFilter === "all" ? "All Status" : statusFilter}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Status
                  </DropdownMenuItem>
                  <Separator />
                  {["active", "inactive", "pending", "locked", "suspended"].map(
                    (s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => setStatusFilter(s)}
                      >
                        <span className="capitalize">{s}</span>
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {onSelectOne && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSelectAll}
                  className="w-10 h-10"
                >
                  <Checkbox checked={allVisibleSelected} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE VIEW (Desktop) ================= */}
      {viewMode === "table" && (
        <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  {onSelectOne && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Guardian</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Academic</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGuardians.map((guardian) => (
                  <TableRow
                    key={guardian?._id || guardian?.id}
                    className="hover:bg-slate-50"
                  >
                    {onSelectOne && (
                      <TableCell>
                        <Checkbox
                          checked={selectedGuardians.includes(
                            guardian._id || guardian.id,
                          )}
                          onCheckedChange={(checked) =>
                            onSelectOne(guardian._id || guardian.id, checked)
                          }
                        />
                      </TableCell>
                    )}

                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <GuardianAvatar
                          name={guardian.name || guardian.guardianName}
                          photo={guardian.guardianPhoto}
                        />
                        <div>
                          <p className="font-medium text-slate-800">
                            {guardian.name || guardian.guardianName}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">
                              {guardian.email}
                            </span>
                          </p>
                          {guardian.relationship && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {guardian.relationship}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="min-w-[150px]">
                        <p className="font-medium text-slate-800">
                          {guardian.studentName}
                        </p>
                        {guardian.dob && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(guardian.dob).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="min-w-[120px]">
                        <AcademicHierarchy guardian={guardian} />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 min-w-[140px]">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{guardian.mobile}</span>
                        </div>
                        {guardian.alternatePhone && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone className="w-3 h-3" />
                            <span>{guardian.alternatePhone}</span>
                          </div>
                        )}
                        {guardian.emergencyContact && (
                          <div className="flex items-center gap-2 text-xs text-amber-600">
                            <span>Emergency: {guardian.emergencyContact}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <StatusBadge status={guardian.status} />
                        {guardian.accountLockedUntil &&
                          new Date(guardian.accountLockedUntil) >
                            new Date() && (
                            <Badge
                              variant="outline"
                              className="text-rose-600 border-rose-200 bg-rose-50 text-[10px]"
                            >
                              Locked until:{" "}
                              {new Date(
                                guardian.accountLockedUntil,
                              ).toLocaleDateString()}
                            </Badge>
                          )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Hierarchy Tooltip */}
                        <HierarchyTooltip guardian={guardian} />

                        {/* Quick Actions */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/dashboard/guardian/${guardian._id}`)
                          }
                          // onClick={() => onView?.(guardian)}
                          className="h-8 w-8"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Reset Password Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleResetPasswordClick(guardian)}
                          className="h-8 w-8"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </Button>

                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => onEdit?.(guardian)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>

                            {guardian.status === "locked" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onUnlockAccount?.(guardian._id || guardian.id)
                                }
                              >
                                <Unlock className="w-4 h-4 mr-2" />
                                Unlock Account
                              </DropdownMenuItem>
                            )}

                            <Separator />

                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteId(guardian._id || guardian.id)
                              }
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ================= GRID VIEW (Mobile/Tablet) ================= */}
      {(viewMode === "grid" || viewMode === "table") && (
        <div className="md:hidden space-y-3">
          {paginatedGuardians.map((guardian) => (
            <Card key={guardian._id || guardian.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3">
                  <GuardianAvatar
                    name={guardian.name || guardian.guardianName}
                    photo={guardian.guardianPhoto}
                  />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {guardian.name || guardian.guardianName}
                    </p>
                    <p className="text-xs text-slate-500">{guardian.email}</p>
                    {guardian.relationship && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {guardian.relationship}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={guardian.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-xs text-slate-500">Student</p>
                  <p className="font-medium">{guardian.studentName}</p>
                  {guardian.dob && (
                    <p className="text-xs text-slate-400">
                      {new Date(guardian.dob).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Contact</p>
                  <p className="font-medium">{guardian.mobile}</p>
                  {guardian.alternatePhone && (
                    <p className="text-xs text-slate-500">
                      Alt: {guardian.alternatePhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-3 p-2 bg-slate-50 rounded-lg">
                <AcademicHierarchy guardian={guardian} />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onView?.(guardian)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleResetPasswordClick(guardian)}
                >
                  <Key className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit?.(guardian)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteId(guardian._id || guardian.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {filteredGuardians.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Showing</span>
            <span className="font-medium">{startIndex + 1}</span>
            <span>to</span>
            <span className="font-medium">
              {Math.min(startIndex + pageSize, filteredGuardians.length)}
            </span>
            <span>of</span>
            <span className="font-medium">{filteredGuardians.length}</span>
            <span>results</span>
          </div>

          <div className="flex items-center gap-4">
            {onLimitChange && (
              <Select
                value={String(pageSize)}
                onValueChange={(value) => onLimitChange(Number(value))}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange?.(currentPage - 1)}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => onPageChange?.(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange?.(currentPage + 1)}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* ================= RESET PASSWORD MODAL ================= */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setSelectedGuardianForReset(null);
        }}
        guardian={selectedGuardianForReset}
        onReset={handlePasswordReset}
      />

      {/* ================= DELETE DIALOG ================= */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Guardian</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this guardian? This action cannot
              be undone. All associated data including login history and device
              information will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Guardian
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ... (GuardianTableSkeleton remains same)
/* ================= SKELETON ================= */
export const GuardianTableSkeleton = () => (
  <div className="space-y-4">
    {/* Header Skeleton */}
    <div className="bg-white rounded-lg border p-4">
      <div className="h-8 bg-slate-200 rounded animate-pulse w-48 mb-4" />
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-slate-200 rounded animate-pulse" />
        <div className="w-[130px] h-10 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>

    {/* Table Skeleton - Desktop */}
    <div className="hidden md:block bg-white rounded-lg border p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex gap-4 pb-2 border-b">
          <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-48 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-24 h-4 bg-slate-200 rounded animate-pulse ml-auto" />
        </div>

        {/* Rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
            <div className="flex items-center gap-2 w-48">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div className="space-y-1 flex-1">
                <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                <div className="h-2 bg-slate-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
            <div className="w-32 space-y-1">
              <div className="h-3 bg-slate-200 rounded animate-pulse" />
              <div className="h-2 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-32 space-y-1">
              <div className="h-3 bg-slate-200 rounded animate-pulse" />
              <div className="h-2 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-32">
              <div className="h-3 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-20">
              <div className="h-4 bg-slate-200 rounded-full animate-pulse w-16" />
            </div>
            <div className="w-24 ml-auto flex gap-1">
              <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
              <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
              <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Card Skeleton - Mobile */}
    <div className="md:hidden space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-32" />
                <div className="h-3 bg-slate-200 rounded animate-pulse w-24" />
              </div>
            </div>
            <div className="w-16 h-5 bg-slate-200 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-3 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-12 bg-slate-200 rounded animate-pulse" />
          <div className="flex justify-end gap-2">
            {[...Array(4)].map((_, j) => (
              <div
                key={j}
                className="w-8 h-8 bg-slate-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
