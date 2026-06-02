// components/guardian/AddGuardianForm/StudentDetails.jsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Calendar } from "lucide-react";

export const StudentDetails = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <h3 className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-widest">
        Student Details
      </h3>

      {/* Student Name */}
      <div className="space-y-2">
        <Label
          htmlFor="studentName"
          className="text-sm font-semibold text-slate-700"
        >
          Student Name <span className="text-red-500">*</span>
        </Label>

        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="studentName"
            placeholder="Full Name"
            {...register("studentName")}
            className={`pl-10 w-full py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.studentName ? "border-red-500" : "border-slate-300"
            }`}
            aria-invalid={errors.studentName ? "true" : "false"}
          />
        </div>

        {errors.studentName && (
          <p className="text-red-500 text-xs font-medium">
            {errors.studentName.message}
          </p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label
          htmlFor="dob"
          className="text-sm font-semibold text-slate-700"
        >
          Date of Birth <span className="text-red-500">*</span>
        </Label>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="dob"
            type="date"
            {...register("dob")}
            className={`pl-10 w-full py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.dob ? "border-red-500" : "border-slate-300"
            }`}
            aria-invalid={errors.dob ? "true" : "false"}
          />
        </div>

        {errors.dob && (
          <p className="text-red-500 text-xs font-medium">
            {errors.dob.message}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton
export const StudentDetailsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
    <div className="space-y-4">
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
    </div>
  </div>
);
