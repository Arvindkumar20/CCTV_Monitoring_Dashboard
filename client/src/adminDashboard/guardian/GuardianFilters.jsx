import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  RotateCcw,
  Users,
  School,
  BookOpen,
  Hash,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

// Status options
const STATUS_OPTIONS = [
  { value: "all", label: "All Status", color: "gray" },
  { value: "active", label: "Active", color: "green" },
  { value: "inactive", label: "Inactive", color: "slate" },
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "locked", label: "Locked", color: "red" },
  { value: "suspended", label: "Suspended", color: "purple" },
];

// Class options
const CLASS_OPTIONS = [
  { value: "all", label: "All Classes" },
  { value: "Nursery", label: "Nursery" },
  { value: "KG", label: "KG" },
  { value: "1", label: "Class 1" },
  { value: "2", label: "Class 2" },
  { value: "3", label: "Class 3" },
  { value: "4", label: "Class 4" },
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },
];

// Section options
const SECTION_OPTIONS = [
  { value: "all", label: "All Sections" },
  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
  { value: "D", label: "Section D" },
  { value: "E", label: "Section E" },
  { value: "F", label: "Section F" },
];

// Group options
const GROUP_OPTIONS = [
  { value: "all", label: "All Groups" },
  { value: "Science", label: "Science" },
  { value: "Commerce", label: "Commerce" },
  { value: "Arts", label: "Arts" },
  { value: "Vocational", label: "Vocational" },
  { value: "null", label: "No Group" },
];

export const GuardianFilters = ({
  filters = {},
  onStatusChange,
  onClassChange,
  onSectionChange,
  onGroupChange,
  onDateRangeChange,
  onSearchChange,
  onReset,
  className = "",
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: filters?.fromDate ? new Date(filters.fromDate) : null,
    to: filters?.toDate ? new Date(filters.toDate) : null,
  });
  const [localSearch, setLocalSearch] = useState(filters?.search || "");

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status && filters.status !== "all") count++;
    if (filters.class && filters.class !== "all") count++;
    if (filters.section && filters.section !== "all") count++;
    if (filters.group && filters.group !== "all") count++;
    if (filters.fromDate || filters.toDate) count++;
    if (filters.search) count++;
    if (filters.verified) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Handle search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(value);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange({
        fromDate: range.from?.toISOString().split('T')[0],
        toDate: range.to?.toISOString().split('T')[0],
      });
    }
  };

  // Handle reset all filters
  const handleResetAll = () => {
    setLocalSearch("");
    setDateRange({ from: null, to: null });
    if (onReset) {
      onReset();
    }
  };

  // Get status color class
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-slate-100 text-slate-700 border-slate-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      locked: "bg-red-100 text-red-700 border-red-200",
      suspended: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <Card className={`border-slate-200 shadow-sm ${className}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h3 className="font-medium text-slate-700">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetAll}
                className="h-8 text-xs text-slate-500 hover:text-slate-700"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-8 text-xs"
            >
              Advanced
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`} />
            </Button>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={onStatusChange}
          >
            <SelectTrigger className="h-9 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${option.color}-500`} />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Class Filter */}
          <Select
            value={filters.class || "all"}
            onValueChange={onClassChange}
          >
            <SelectTrigger className="h-9 text-sm">
              <div className="flex items-center gap-2">
                <School className="w-3.5 h-3.5 text-slate-400" />
                <SelectValue placeholder="Filter by class" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {CLASS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Section Filter */}
          <Select
            value={filters.section || "all"}
            onValueChange={onSectionChange}
          >
            <SelectTrigger className="h-9 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <SelectValue placeholder="Filter by section" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {SECTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Search guardians..."
              value={localSearch}
              onChange={handleSearchChange}
              className="h-9 pl-8 text-sm"
            />
            <Filter className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Group Filter */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Academic Group
                </label>
                <Select
                  value={filters.group || "all"}
                  onValueChange={onGroupChange}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Registration Date Range
                </label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`flex-1 justify-start text-left font-normal h-9 ${
                          !dateRange.from && "text-slate-400"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {dateRange.from ? (
                          format(dateRange.from, "PPP")
                        ) : (
                          <span>From date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) =>
                          handleDateRangeChange({ ...dateRange, from: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-slate-400">to</span>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`flex-1 justify-start text-left font-normal h-9 ${
                          !dateRange.to && "text-slate-400"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {dateRange.to ? (
                          format(dateRange.to, "PPP")
                        ) : (
                          <span>To date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) =>
                          handleDateRangeChange({ ...dateRange, to: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                className={`justify-start ${
                  filters.verified === true ? "border-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => onStatusChange?.("verified")}
              >
                <Mail className="w-3.5 h-3.5 mr-2" />
                Email Verified
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`justify-start ${
                  filters.mobileVerified === true ? "border-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => onStatusChange?.("mobile_verified")}
              >
                <Phone className="w-3.5 h-3.5 mr-2" />
                Mobile Verified
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`justify-start ${
                  filters.hasAddress ? "border-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => onStatusChange?.("has_address")}
              >
                <MapPin className="w-3.5 h-3.5 mr-2" />
                Has Address
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`justify-start ${
                  filters.recentlyActive ? "border-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => onStatusChange?.("recently_active")}
              >
                <Clock className="w-3.5 h-3.5 mr-2" />
                Recently Active
              </Button>
            </div>
          </>
        )}

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
            {filters.status && filters.status !== "all" && (
              <Badge className={`${getStatusColor(filters.status)} border`}>
                Status: {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => onStatusChange("all")}
                />
              </Badge>
            )}

            {filters.class && filters.class !== "all" && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Class: {filters.class}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => onClassChange("all")}
                />
              </Badge>
            )}

            {filters.section && filters.section !== "all" && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Section: {filters.section}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => onSectionChange("all")}
                />
              </Badge>
            )}

            {filters.group && filters.group !== "all" && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Group: {filters.group === "null" ? "No Group" : filters.group}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => onGroupChange?.("all")}
                />
              </Badge>
            )}

            {filters.search && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Search: "{filters.search}"
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => {
                    setLocalSearch("");
                    onSearchChange?.("");
                  }}
                />
              </Badge>
            )}

            {(filters.fromDate || filters.toDate) && (
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                Date: {filters.fromDate || "..."} - {filters.toDate || "..."}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => {
                    setDateRange({ from: null, to: null });
                    onDateRangeChange?.({ fromDate: null, toDate: null });
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Skeleton Loading Component
export const GuardianFiltersSkeleton = () => (
  <Card className="border-slate-200 shadow-sm">
    <CardContent className="p-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Filters Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>

      {/* Active Filters Skeleton */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
        <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);