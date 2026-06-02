// // Form Skeleton
export const CategoryFormSkeleton = () => (
  <div className="space-y-5">
    <div className="space-y-2">
      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
      <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
    </div>
    <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
  </div>
);

// Updated CategoryForm with edit support
// components/category/CategoryForm.jsx (updated)
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2, X } from "lucide-react";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(3, "Category name must be at least 3 characters"),
  description: z.string().optional(),
});

export const CategoryForm = ({
  onSubmit,
  isSubmitting = false,
  initialData = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name);
      setValue("description", initialData.description || "");
    } else {
      reset();
    }
  }, [initialData, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
    if (!initialData) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
          Category Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. 10th Class"
          {...register("name")}
          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
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

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-semibold text-slate-700"
        >
          Description{" "}
          <span className="text-slate-400 font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="description"
          rows="3"
          placeholder="Enter details..."
          {...register("description")}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {initialData ? "Updating..." : "Saving..."}
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {initialData ? "Update Category" : "Save Category"}
          </>
        )}
      </Button>
    </form>
  );
};
