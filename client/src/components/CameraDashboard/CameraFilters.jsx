// frontend/src/components/CameraDashboard/CameraFilters.jsx
import React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const CameraFilters = ({ filterStatus, setFilterStatus, totalCameras }) => {
  const filters = [
    { value: 'all', label: 'All', color: 'default' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'online', label: 'Online', color: 'blue' },
    { value: 'offline', label: 'Offline', color: 'orange' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <div className="flex items-center gap-1.5 mr-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-600">Filter:</span>
      </div>
      
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={filterStatus === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus(filter.value)}
          className="capitalize"
        >
          {filter.label}
          {filterStatus === filter.value && (
            <Badge variant="secondary" className="ml-1.5 px-1.5 text-xs">
              {totalCameras}
            </Badge>
          )}
        </Button>
      ))}
      
      {filterStatus !== 'all' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilterStatus('all')}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      )}
      
      <div className="ml-auto text-sm text-slate-500">
        {totalCameras} camera{totalCameras !== 1 ? 's' : ''} found
      </div>
    </div>
  );
};