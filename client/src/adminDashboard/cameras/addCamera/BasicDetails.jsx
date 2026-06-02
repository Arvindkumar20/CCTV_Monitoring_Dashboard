// components/camera/AddCameraForm/BasicDetails.jsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "lucide-react";

export const BasicDetails = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Camera Name */}
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
          Camera Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. Playground Entry Cam"
          {...register("name")}
          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
            errors.name ? "border-red-500" : "border-slate-300"
          }`}
          aria-invalid={errors.name ? "true" : "false"}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* RTSP URL */}
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="rtspUrl" className="text-sm font-semibold text-slate-700">
          RTSP URL <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Link className="w-4 h-4" />
          </div>
          <Input
            id="rtspUrl"
            placeholder="rtsp://username:password@ip_address:port/path"
            {...register("rtspUrl")}
            className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm ${
              errors.rtspUrl ? "border-red-500" : "border-slate-300"
            }`}
            aria-invalid={errors.rtspUrl ? "true" : "false"}
          />
        </div>
        {errors.rtspUrl ? (
          <p className="text-red-500 text-xs mt-1.5 font-medium">
            {errors.rtspUrl.message}
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 mt-1.5 px-1 italic">
            Note: Ensure the URL is accessible from the school network.
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton
export const BasicDetailsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2 space-y-2">
      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
    </div>
    <div className="md:col-span-2 space-y-2">
      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
      <div className="h-3 w-64 bg-slate-200 rounded animate-pulse" />
    </div>
  </div>
);