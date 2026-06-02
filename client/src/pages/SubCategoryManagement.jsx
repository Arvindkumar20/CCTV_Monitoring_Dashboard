// pages/SubCategoryManagement.jsx
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw } from "lucide-react";

// Import components

// Import hooks
import { useSubCategories } from "@/hooks/useSubCategories";
import AdminLayout from "@/components/layout/AdminLayout";
import { Header } from "@/adminDashboard/dashboard/Header";
import {
  SubCategoryForm,
  SubCategoryFormSkeleton,
} from "@/adminDashboard/subcategory/SubCategoryForm";
import {
  SubCategoryTable,
  SubCategoryTableSkeleton,
} from "@/adminDashboard/subcategory/SubCategoryTable";
import { BackButton } from "@/components/common/BackButton";

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Alert variant="destructive" className="max-w-lg">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="mt-2">{error.message}</AlertDescription>
      <Button onClick={resetErrorBoundary} className="mt-4">
        <RefreshCw className="w-4 h-4 mr-2" /> Try again
      </Button>
    </Alert>
  </div>
);

function SubCategoryManagementContent() {
  const {
    mainCategories,
    subCategories,
    loading,
    isSubmitting,
    addSubCategory,
    editSubCategory,
    removeSubCategory,
  } = useSubCategories();

  const [editingSubCategory, setEditingSubCategory] = useState(null);

  const handleFormSubmit = async (data) => {
    if (editingSubCategory) {
      const success = await editSubCategory(editingSubCategory._id, data);
      if (success) setEditingSubCategory(null);
    } else {
      await addSubCategory(data);
    }
  };

  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await removeSubCategory(id);
  };

  const handleCancelEdit = () => {
    setEditingSubCategory(null);
  };

  return (
    <AdminLayout>
      <div className="bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Navigation */}
          <BackButton
            to="/dashboard"
            label="Back to dashboard"
            toAction="/dashboard/sub-sub-categories"
            labelForAction="3 level Category"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Side: Form */}
            <div className="lg:col-span-5">
              <Card className="sticky top-8 border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 bg-emerald-50/30">
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {editingSubCategory
                      ? "Edit Sub Category"
                      : "Create Sub Category"}
                  </CardTitle>
                  {editingSubCategory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="absolute top-6 right-6 text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  {loading ? (
                    <SubCategoryFormSkeleton />
                  ) : (
                    <SubCategoryForm
                      mainCategories={mainCategories}
                      onSubmit={handleFormSubmit}
                      isSubmitting={isSubmitting}
                      initialData={editingSubCategory}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Table */}
            <div className="lg:col-span-7">
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900">
                      Sub Category List
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600"
                    >
                      Total: {subCategories.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <SubCategoryTableSkeleton />
                  ) : (
                    <SubCategoryTable
                      subCategories={subCategories}
                      mainCategories={mainCategories}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Main Component with Error Boundary
export default function SubCategoryManagement() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <SubCategoryManagementContent />
    </ErrorBoundary>
  );
}
