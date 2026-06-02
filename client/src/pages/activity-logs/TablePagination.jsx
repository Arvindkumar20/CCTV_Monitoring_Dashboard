// components/activity-logs/TablePagination.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const TablePagination = ({ 
  currentPage, 
  totalPages, 
  totalRecords,
  onPageChange 
}) => {
  return (
    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
      <p className="text-xs text-slate-500">
        Showing last {totalRecords > 50 ? 50 : totalRecords} events. Total records: {totalRecords.toLocaleString()}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 h-auto text-xs font-bold"
        >
          <ChevronLeft className="w-3 h-3 mr-1" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 h-auto text-xs font-bold"
        >
          Next
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Pagination Skeleton
export const TablePaginationSkeleton = () => (
  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
    <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
    <div className="flex gap-2">
      <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
      <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
    </div>
  </div>
);