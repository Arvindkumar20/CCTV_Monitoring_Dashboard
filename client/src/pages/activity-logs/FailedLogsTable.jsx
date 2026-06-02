// components/activity-logs/FailedLogsTable.jsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export const FailedLogsTable = ({ logs, onViewIPInfo }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-red-50 text-red-600 text-[11px] uppercase tracking-wider font-bold">
            <TableHead className="px-6 py-4">Alert Time</TableHead>
            <TableHead className="px-6 py-4">Target Identity</TableHead>
            <TableHead className="px-6 py-4">Failure Reason</TableHead>
            <TableHead className="px-6 py-4">Origin / IP</TableHead>
            <TableHead className="px-6 py-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index} className="bg-red-50/20 hover:bg-red-50/40">
              <TableCell className="px-6 py-4">
                <div className="text-sm font-bold text-red-700">{log.time}</div>
                <div className="text-[10px] text-red-400 uppercase">{log.date}</div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="font-semibold text-slate-700">{log.target}</div>
                <div className="text-[10px] text-slate-400">{log.type}</div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <Badge className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded border-0">
                  {log.reason}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="text-xs text-slate-500">{log.location}</div>
                <div className="text-[10px] font-mono text-slate-400">{log.ipAddress}</div>
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Button
                  variant="link"
                  onClick={() => onViewIPInfo?.(log)}
                  className="text-xs font-bold text-blue-600 hover:underline h-auto p-0"
                >
                  <Info className="w-3 h-3 mr-1" />
                  View IP Info
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};