// pages/AddCamera.jsx (or components/camera/AddCameraForm/index.jsx)
import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

// Import sub-components
import { CameraFormHeader, CameraFormHeaderSkeleton } from "./addCamera/CameraFormHeader";
import { BasicDetails, BasicDetailsSkeleton } from "./addCamera/BasicDetails";
import { FormActions, FormActionsSkeleton } from "./addCamera/FormActions";
import { HierarchySelector, HierarchySelectorSkeleton } from "./addCamera/HierarchySelector";

// Validation schema
const cameraSchema = z.object({
  name: z
    .string()
    .min(1, "Camera name is required")
    .min(3, "Camera name must be at least 3 characters"),
  rtspUrl: z
    .string()
    .min(1, "RTSP URL is required")
    .url("Please enter a valid URL")
    .startsWith("rtsp://", "RTSP URL must start with rtsp://"),
  mainCategoryId: z.string().min(1, "Please select a main category"),
  subCategoryId: z.string().optional(),
  nestedSubCategoryId: z.string().optional(), // Fixed: Changed from subSubCategoryId to match usage
  location: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  isActive: z.boolean().default(true),
});

// Loading State Component
const FormSkeleton = () => (
  <>
    <CameraFormHeaderSkeleton />
    <CardContent className="p-8 space-y-6">
      <BasicDetailsSkeleton />
      <HierarchySelectorSkeleton />
      <FormActionsSkeleton />
    </CardContent>
  </>
);

export default function AddCamera({
  mainCategories = [],
  subCategories = [],
  nestedSubCategories = [],
  onSubmit,
  isSubmitting = false,
  initialData = null,
  onCancel,
}) {
  const navigate = useNavigate();

  const methods = useForm({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      name: "",
      rtspUrl: "",
      mainCategoryId: "",
      subCategoryId: "",
      nestedSubCategoryId: "",
      location: "",
      status: "active",
      isActive: true,
      ...(initialData && {
        name: initialData.name || "",
        rtspUrl: initialData.rtspUrl || initialData.url || "",
        mainCategoryId: initialData.mainCategoryId?._id || initialData.mainCategoryId || "",
        subCategoryId: initialData.subCategoryId?._id || initialData.subCategoryId || "",
        nestedSubCategoryId: initialData.nestedSubCategoryId?._id || initialData.nestedSubCategoryId || "",
        location: initialData.location || "",
        status: initialData.status || "active",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      }),
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = methods;

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        rtspUrl: initialData.rtspUrl || initialData.url || "",
        mainCategoryId: initialData.mainCategoryId?._id || initialData.mainCategoryId || "",
        subCategoryId: initialData.subCategoryId?._id || initialData.subCategoryId || "",
        nestedSubCategoryId: initialData.nestedSubCategoryId?._id || initialData.nestedSubCategoryId || "",
        location: initialData.location || "",
        status: initialData.status || "active",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    if (onSubmit) {
      const success = await onSubmit(data);
      if (success) {
        // Don't navigate here - let parent handle it
        // Parent component will close dialog on success
      }
    } else {
      // Fallback if no onSubmit prop provided
      console.warn("No onSubmit handler provided");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/dashboard/cameras");
    }
  };

  // Filter subCategories based on selected mainCategory
  const filteredSubCategories = React.useMemo(() => {
    const mainCategoryId = watch("mainCategoryId");
    if (!mainCategoryId || !subCategories.length) return [];
    
    return subCategories.filter(sub => {
      const subMainId = sub.mainCategoryId?._id || sub.mainCategoryId;
      return String(subMainId) === String(mainCategoryId);
    });
  }, [watch("mainCategoryId"), subCategories]);

  // Filter nestedSubCategories based on selected subCategory
  const filteredNestedSubCategories = React.useMemo(() => {
    const subCategoryId = watch("subCategoryId");
    if (!subCategoryId || !nestedSubCategories.length) return [];
    
    return nestedSubCategories.filter(nested => {
      const nestedSubId = nested.subCategoryId?._id || nested.subCategoryId;
      return String(nestedSubId) === String(subCategoryId);
    });
  }, [watch("subCategoryId"), nestedSubCategories]);

  const isLoading = !mainCategories.length; // or any loading condition

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <FormSkeleton />
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <CameraFormHeader
                title={initialData ? "Edit Camera" : "Add New Camera"}
                description={initialData 
                  ? "Edit camera details and RTSP stream configuration"
                  : "Configure RTSP stream and link to categories"
                }
                onClose={handleCancel}
              />

              <CardContent className="p-8 space-y-6">
                <BasicDetails />
                <HierarchySelector
                  mainCategories={mainCategories}
                  subCategories={filteredSubCategories}
                  nestedSubCategories={filteredNestedSubCategories}
                />
                <FormActions 
                  onCancel={handleCancel} 
                  isSubmitting={isSubmitting}
                  isEditing={!!initialData}
                />
              </CardContent>
            </form>
          </FormProvider>
        )}
      </Card>
    </div>
  );
}