import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Import hooks
import { useGuardians } from "@/hooks/useGuardians";
import { FormHeader, FormHeaderSkeleton } from "./addGuardianForm/FormHeader";
import {
  GuardianDetails,
  GuardianDetailsSkeleton,
} from "./addGuardianForm/GuardianDetails";
import {
  StudentDetails,
  StudentDetailsSkeleton,
} from "./addGuardianForm/StudentDetails";
import {
  AcademicMapping,
  AcademicMappingSkeleton,
} from "./addGuardianForm/AcademicMapping";
import {
  PasswordPreview,
  PasswordPreviewSkeleton,
} from "./addGuardianForm/PasswordPreview";
import {
  FormActions,
  FormActionsSkeleton,
} from "./addGuardianForm/FormActions";
import { da } from "date-fns/locale";

// Validation schema - UPDATED field names to match AcademicMapping
const guardianSchema = z.object({
  guardianName: z
    .string()
    .min(1, "Guardian name is required")
    .min(3, "Guardian name must be at least 3 characters")
    .max(100, "Guardian name cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Guardian name can only contain letters and spaces",
    ),

  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(
      /^(\+91|0)?[6-9]\d{9}$/,
      "Please enter a valid Indian mobile number (10 digits starting with 6-9)",
    ),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),

  studentName: z
    .string()
    .min(1, "Student name is required")
    .min(3, "Student name must be at least 3 characters")
    .max(100, "Student name cannot exceed 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Student name can only contain letters and spaces"),

  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age >= 3 && age <= 20;
    }, "Student age must be between 3 and 20 years"),

  // Changed from 'class' to 'mainCategoryId' to match AcademicMapping
  mainCategoryId: z.string().min(1, "Please select a class"),
  // Changed from 'section' to 'subCategoryId' to match AcademicMapping
  subCategoryId: z.string().min(1, "Please select a section"),
  // Changed from 'group' to 'subSubCategoryId' to match AcademicMapping
  subSubCategoryId: z.string().optional(),

  relationship: z.string().default("Parent"),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  occupation: z.string().optional(),
  alternatePhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+91|0)?[6-9]\d{9}$/.test(val),
      "Please enter a valid Indian mobile number",
    ),
  emergencyContact: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+91|0)?[6-9]\d{9}$/.test(val),
      "Please enter a valid Indian mobile number",
    ),
});

// Loading State Component
const FormSkeleton = () => (
  <>
    <FormHeaderSkeleton />
    <CardContent className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GuardianDetailsSkeleton />
        <StudentDetailsSkeleton />
      </div>
      <AcademicMappingSkeleton />
      <PasswordPreviewSkeleton />
      <FormActionsSkeleton />
    </CardContent>
  </>
);

export default function AddGuardian({
  onSubmit: externalOnSubmit,
  isSubmitting: externalIsSubmitting,
  initialData = null,
  onCancel: externalOnCancel,
  onSuccess,
}) {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const {
    addGuardian,
    editGuardian,
    getGuardianById,
    isSubmitting: hookIsSubmitting,
  } = useGuardians();

  const [loading, setLoading] = useState(false);
  const [isLoadingGuardian, setIsLoadingGuardian] = useState(!!id);
  const [formError, setFormError] = useState(null);
  const [guardianData, setGuardianData] = useState(null);

  const isEditMode = !!id || !!initialData;

  const methods = useForm({
    resolver: zodResolver(guardianSchema),
    mode: "onChange",
    defaultValues: {
      guardianName: "",
      mobile: "",
      email: "",
      studentName: "",
      dob: "",
      mainCategoryId: "",
      subCategoryId: "",
      subSubCategoryId: "",
      relationship: "Parent",
      address: {
        city: "",
        state: "",
        country: "",
      },
      occupation: "",
      alternatePhone: "",
      emergencyContact: "",
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
    setError,
    clearErrors,
  } = methods;

  const watchGuardianName = watch("guardianName");
  const watchStudentName = watch("studentName");
  const watchDob = watch("dob");

  // Load guardian data if in edit mode
  useEffect(() => {
    const loadGuardianData = async () => {
      if (!id && !initialData) return;

      try {
        setIsLoadingGuardian(true);
        setFormError(null);

        let data = initialData;

        // If only ID is provided, fetch from API
        if (id && !initialData) {
          const response = await getGuardianById(id);
          data = response?.data || response;
        }

        if (data) {
          setGuardianData(data);

          // Format date for input (YYYY-MM-DD)
          let formattedDob = data.dob;
          if (data.dob) {
            const date = new Date(data.dob);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            formattedDob = `${year}-${month}-${day}`;
          }

          // Reset form with guardian data - UPDATED field mappings
          reset({
            guardianName: data.guardianName || data.name || "",
            mobile: data.mobile || data.phone || "",
            email: data.email || "",
            studentName: data.studentName || data.student?.name || "",
            dob: formattedDob || "",
            mainCategoryId: data.mainCategoryId || data.class || "",
            subCategoryId: data.subCategoryId || data.section || "",
            subSubCategoryId: data.subSubCategoryId || data.group || "",
            relationship: data.relationship || "Parent",
            address: data.address,

            occupation: data.occupation || "",
            alternatePhone: data.alternatePhone || "",
            emergencyContact: data.emergencyContact || "",
          });
        }
      } catch (error) {
        console.error("Failed to load guardian data:", error);
        setFormError(error.message || "Failed to load guardian data");
      } finally {
        setIsLoadingGuardian(false);
      }
    };

    loadGuardianData();
  }, [id, initialData, getGuardianById, reset]);

  // Check for duplicate mobile/email in real-time (optional)
  const checkDuplicate = async (field, value) => {
    // You can implement duplicate check API call here
    return true;
  };

  // Handle mobile blur for validation
  const handleMobileBlur = async () => {
    const mobile = watch("mobile");
    if (mobile && mobile.length >= 10) {
      const isValid = await checkDuplicate("mobile", mobile);
      if (!isValid) {
        setError("mobile", {
          type: "manual",
          message: "Mobile number already registered",
        });
      } else {
        clearErrors("mobile");
      }
    }
  };

  // Handle email blur for validation
  const handleEmailBlur = async () => {
    const email = watch("email");
    if (email && email.includes("@")) {
      const isValid = await checkDuplicate("email", email);
      if (!isValid) {
        setError("email", {
          type: "manual",
          message: "Email already registered",
        });
      } else {
        clearErrors("email");
      }
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data) => {
    console.log(data)
    console.log("Form submitted with data:", data);
    try {
      setFormError(null);

      // If external onSubmit is provided, use it
      if (externalOnSubmit) {
        await externalOnSubmit(data);
        return;
      }

      // Prepare data for API - UPDATED field mappings
      const guardianData = {
        guardianName: data.guardianName,
        mobile: data.mobile.replace(/\s+/g, ""),
        email: data.email.toLowerCase(),
        studentName: data.studentName,
        dob: data.dob,
        Class: data.mainCategoryId,
        section: data.subCategoryId,
        group: data.subSubCategoryId || null,
        relationship: data.relationship || "Parent",
        address: {
          city: data?.city || "",
          state: data?.state || "",
        
          country: data?.country || "",
        },

        occupation: data.occupation || undefined,
        alternatePhone: data.alternatePhone?.replace(/\s+/g, "") || undefined,
        emergencyContact:
          data.emergencyContact?.replace(/\s+/g, "") || undefined,
      };

      console.log("Sending to API:", guardianData);

      let success;
      if (isEditMode) {
        const guardianId = id || initialData?._id || initialData?.id;
        success = await editGuardian(guardianId, guardianData);
      } else {
        success = await addGuardian(guardianData);
      }

      if (success) {
        if (onSuccess) {
          onSuccess(success);
        }

        // Navigate back to guardians list
        if (!externalOnCancel) {
          navigate("/dashboard/guardians");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError(error.message || "Failed to save guardian");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (externalOnCancel) {
      externalOnCancel();
    } else {
      navigate("/dashboard/guardians");
    }
  };

  const isSubmittingState = externalIsSubmitting || hookIsSubmitting;
  const isFormValid = isValid && (isDirty || isEditMode);
  const submitLabel = isEditMode ? "Update Guardian" : "Add Guardian";

  // Show loading state
  if (isLoadingGuardian) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl border-slate-200 shadow-sm overflow-hidden">
          <FormSkeleton />
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl border-slate-200 shadow-sm overflow-hidden">
        {/* Error Alert */}
        {formError && (
          <Alert variant="destructive" className="m-6 mb-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert
            variant="warning"
            className="m-6 mb-0 bg-amber-50 border-amber-200"
          >
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Please fix the following errors:
              <ul className="list-disc list-inside mt-2 text-sm">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>
                    <span className="font-medium">{key}:</span> {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <FormHeader
              title={isEditMode ? "Edit Guardian" : "Add New Guardian"}
              description="Manual registration for parent access"
              onClose={handleCancel}
            />

            <CardContent className="p-8 space-y-8">
              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GuardianDetails
                  onMobileBlur={handleMobileBlur}
                  onEmailBlur={handleEmailBlur}
                />
                <StudentDetails />
              </div>

              {/* Academic Mapping */}
              <AcademicMapping />

              {/* Password Preview - Only show for new guardians */}
              {!isEditMode && (
                <PasswordPreview
                />
              )}

              {/* Form Actions */}
              <FormActions
                onCancel={handleCancel}
                isSubmitting={isSubmittingState}
                submitLabel={submitLabel}
                isValid={isFormValid}
              />
            </CardContent>
          </form>
        </FormProvider>

        {/* Development Mode Debug Info */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="px-8 pb-4">
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer">Form Debug Info</summary>
              <pre className="mt-2 p-2 bg-slate-100 rounded overflow-auto max-h-40">
                {JSON.stringify(
                  {
                    isValid,
                    isDirty,
                    errorCount: Object.keys(errors).length,
                    values: watch(),
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )} */}
      </Card>
    </div>
  );
}
