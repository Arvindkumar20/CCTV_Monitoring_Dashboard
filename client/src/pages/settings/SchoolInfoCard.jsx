// components/settings/SchoolInfoCard.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const SchoolInfoCard = ({ data, onChange }) => {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-100">
        <CardTitle className="font-bold text-slate-800">School Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName" className="text-xs font-bold text-slate-500 uppercase">
              School Name
            </Label>
            <Input
              id="schoolName"
              value={data?.schoolName || ""}
              onChange={(e) => onChange?.("schoolName", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolAddress" className="text-xs font-bold text-slate-500 uppercase">
              School Address
            </Label>
            <Textarea
              id="schoolAddress"
              rows="2"
              value={data?.schoolAddress || ""}
              onChange={(e) => onChange?.("schoolAddress", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schoolPhone" className="text-xs font-bold text-slate-500 uppercase">
                Phone
              </Label>
              <Input
                id="schoolPhone"
                value={data?.schoolPhone || ""}
                onChange={(e) => onChange?.("schoolPhone", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolEmail" className="text-xs font-bold text-slate-500 uppercase">
                Email
              </Label>
              <Input
                id="schoolEmail"
                type="email"
                value={data?.schoolEmail || ""}
                onChange={(e) => onChange?.("schoolEmail", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton
export const SchoolInfoCardSkeleton = () => (
  <Card className="border-slate-200">
    <CardHeader className="p-6 border-b border-slate-100">
      <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
    </CardHeader>
    <CardContent className="p-6 space-y-4">
      <div className="h-12 bg-slate-200 rounded animate-pulse" />
      <div className="h-16 bg-slate-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-slate-200 rounded animate-pulse" />
        <div className="h-12 bg-slate-200 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);