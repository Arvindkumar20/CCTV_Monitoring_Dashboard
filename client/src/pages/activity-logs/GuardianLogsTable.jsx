// components/activity-logs/GuardianLogsTable.jsx
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
import { Smartphone, Monitor } from "lucide-react";

const getDeviceIcon = (device) => {
  if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
    return <Smartphone className="w-3 h-3 mr-1 inline" />;
  }
  return <Monitor className="w-3 h-3 mr-1 inline" />;
};

export const GuardianLogsTable = ({ logs }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
            <TableHead className="px-6 py-4">Timestamp</TableHead>
            <TableHead className="px-6 py-4">Guardian / Student</TableHead>
            <TableHead className="px-6 py-4">Device</TableHead>
            <TableHead className="px-6 py-4">IP Address</TableHead>
            <TableHead className="px-6 py-4 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
              <TableCell className="px-6 py-4">
                <div className="text-sm font-medium text-slate-900">{log.time}</div>
                <div className="text-[10px] text-slate-400 uppercase">{log.date}</div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="font-semibold text-slate-700">{log.guardianName}</div>
                <div className="text-xs text-slate-500">{log.studentInfo}</div>
              </TableCell>
              <TableCell className="px-6 py-4 text-xs text-slate-500">
                {getDeviceIcon(log.device)} {log.device}
              </TableCell>
              <TableCell className="px-6 py-4 text-xs font-mono text-slate-500">
                {log.ipAddress}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Badge className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold border-0">
                  SUCCESS
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};