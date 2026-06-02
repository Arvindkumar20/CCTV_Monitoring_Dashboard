// components/subcategory/SubCategoryForm.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";

// Validation schema
const subCategorySchema = z.object({
  mainCategoryId: z.string().min(1, "Please select a main category"),
  name: z
    .string()
    .min(1, "Sub category name is required")
    .min(2, "Sub category name must be at least 2 characters"),
  description: z.string().optional(),
});

export const SubCategoryForm = ({
  mainCategories = [],
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
    watch,
  } = useForm({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      mainCategoryId: "",
      name: "",
      description: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setValue("mainCategoryId", initialData.mainCategoryId);
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

  const selectedCategory = watch("mainCategoryId");
  const selectedMainCategory = mainCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Main Category Select */}
      <div className="space-y-2">
        <Label htmlFor="mainCategory" className="text-sm font-semibold text-slate-700">
          Select Main Category <span className="text-red-500">*</span>
        </Label>
      <Select
  value={watch("mainCategoryId")}
  onValueChange={(value) => setValue("mainCategoryId", value)}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Choose Main Category..." />
  </SelectTrigger>

  <SelectContent>
    {mainCategories?.map((category) => (
      <SelectItem key={category._id} value={category._id}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
        {errors.mainCategoryId && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">
            {errors.mainCategoryId.message}
          </p>
        )}
      </div>

      {/* Sub Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
          Sub Category Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. Section A"
          {...register("name")}
          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all ${
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

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
          Description <span className="text-slate-400 font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="description"
          rows="2"
          placeholder="e.g. Morning Batch"
          {...register("description")}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
        />
      </div>

      {/* Preview Badge (optional) */}
      {selectedMainCategory && (
        <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500">Creating for:</span>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: `${selectedMainCategory.color}20`,
              color: selectedMainCategory.color,
              borderColor: `${selectedMainCategory.color}40`,
            }}
          >
            {selectedMainCategory.name}
          </span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {initialData ? "Updating..." : "Saving..."}
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {initialData ? "Update Sub Category" : "Save Sub Category"}
          </>
        )}
      </Button>
    </form>
  );
};

// Form Skeleton
export const SubCategoryFormSkeleton = () => (
  <div className="space-y-5">
    <div className="space-y-2">
      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
      <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
      <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
    </div>
    <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
  </div>
);