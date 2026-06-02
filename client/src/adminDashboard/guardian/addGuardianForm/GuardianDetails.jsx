import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone } from "lucide-react";

export const GuardianDetails = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <h3 className="text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-widest">
        Guardian Details
      </h3>

      {/* Guardian Name */}
      <div className="space-y-2">
        <Label
          htmlFor="guardianName"
          className="text-sm font-semibold text-slate-700"
        >
          Guardian Name <span className="text-red-500">*</span>
        </Label>

        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="guardianName"
            placeholder="Full Name"
            {...register("guardianName")}
            className={`pl-10 w-full py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all ${
              errors.guardianName ? "border-red-500 bg-red-50" : "border-slate-300"
            }`}
            aria-invalid={errors.guardianName ? "true" : "false"}
          />
        </div>

        {errors.guardianName && (
          <p className="text-red-500 text-xs font-medium">
            {errors.guardianName.message}
          </p>
        )}
      </div>

      {/* Mobile */}
      <div className="space-y-2">
        <Label
          htmlFor="mobile"
          className="text-sm font-semibold text-slate-700"
        >
          Mobile Number <span className="text-red-500">*</span>
        </Label>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="mobile"
            type="tel"
            placeholder="+91 00000 00000"
            {...register("mobile")}
            className={`pl-10 w-full py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all ${
              errors.mobile ? "border-red-500 bg-red-50" : "border-slate-300"
            }`}
            aria-invalid={errors.mobile ? "true" : "false"}
          />
        </div>

        {errors.mobile && (
          <p className="text-red-500 text-xs font-medium">
            {errors.mobile.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-semibold text-slate-700"
        >
          Email Address <span className="text-red-500">*</span>
        </Label>

        <Input
          id="email"
          type="email"
          placeholder="parent@example.com"
          {...register("email")}
          className={`w-full py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all ${
            errors.email ? "border-red-500 bg-red-50" : "border-slate-300"
          }`}
          aria-invalid={errors.email ? "true" : "false"}
        />

        {errors.email && (
          <p className="text-red-500 text-xs font-medium">
            {errors.email.message}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton
export const GuardianDetailsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
    <div className="space-y-4">
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
    </div>
  </div>
);