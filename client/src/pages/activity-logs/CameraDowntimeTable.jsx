// components/activity-logs/CameraDowntimeTable.jsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WifiOff } from "lucide-react";

export const CameraDowntimeTable = ({ logs }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-50 text-amber-700 text-[11px] uppercase tracking-wider font-bold">
            <TableHead className="px-6 py-4">Issue Reported</TableHead>
            <TableHead className="px-6 py-4">Camera Asset</TableHead>
            <TableHead className="px-6 py-4">Duration</TableHead>
            <TableHead className="px-6 py-4">Error Type</TableHead>
            <TableHead className="px-6 py-4 text-right">Current Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index} className="hover:bg-amber-50/50">
              <TableCell className="px-6 py-4">
                <div className="text-sm font-medium text-amber-900">{log.time}</div>
                <div className="text-[10px] text-amber-500 uppercase">{log.date}</div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="font-bold text-slate-700">{log.cameraName}</div>
                <div className="text-[10px] text-slate-400">ID: {log.cameraId}</div>
              </TableCell>
              <TableCell className="px-6 py-4 text-sm text-slate-600 font-semibold">
                {log.duration}
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex items-center text-xs text-amber-700">
                  <WifiOff className="w-3 h-3 mr-2" />
                  {log.errorType}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Badge className={`px-2 py-0.5 text-[10px] font-bold border-0 ${
                  log.status === 'RESOLVED' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-amber-500 text-white'
                }`}>
                  {log.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};