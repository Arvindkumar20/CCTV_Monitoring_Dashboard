// pages/CategoryManagement.jsx
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

// Import hooks
import { useCategories } from "@/hooks/useCategories";
// Import components
import { BackButton } from "@/components/common/BackButton";

import {
  CategoryForm,
  CategoryFormSkeleton,
} from "@/adminDashboard/category/CategoryForm";
import {
  CategoryTable,
  CategoryTableSkeleton,
} from "@/adminDashboard/category/CategoryTable";
import AdminLayout from "@/components/layout/AdminLayout";
import { Header } from "@/adminDashboard/dashboard/Header";
import { CategoryHeader } from "@/adminDashboard/shared/CategoryHeader";

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

function CategoryManagementContent() {
  // const navigate = useNavigate();
  const {
    categories,
    loading,
    isSubmitting,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories();

  const [editingCategory, setEditingCategory] = useState(null);
// console.log(categories)
  const handleFormSubmit = async (data) => {
    if (editingCategory) {
      // console.log(editingCategory)
      const success = await editCategory(editingCategory._id, data);
      if (success) setEditingCategory(null);
    } else {
      await addCategory(data);
    }
  };
console.log(categories)
  const handleEdit = (category) => {
    setEditingCategory(category);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await removeCategory(id);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  return (
    <AdminLayout>
      <div className="bg-slate-50 min-h-screen py-5">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <BackButton
              to="/dashboard"
              label="Back to Dashboard"
              toAction="/dashboard/sub-categories"
              labelForAction="Sub category"
            />
            {editingCategory && (
              <Button
                variant="ghost"
                onClick={handleCancelEdit}
                className="text-slate-500 hover:text-slate-700"
              >
                Cancel Editing
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Side: Form */}
            <div className="lg:col-span-2">
              <Card className="sticky top-8 border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 bg-emerald-50/30">
                  <CardTitle className="text-xl font-bold text-slate-900">
                    {editingCategory ? "Edit  Category" : "Create  Category"}
                  </CardTitle>
                  {editingCategory && (
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
                    <CategoryFormSkeleton />
                  ) : (
                    <CategoryForm
                      key={editingCategory?._id}
                      onSubmit={handleFormSubmit}
                      isSubmitting={isSubmitting}
                      initialData={editingCategory}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side: Categories Table */}
            <div className="lg:col-span-3">
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CategoryHeader
                  title="Existing Categories"
                  totalCount={categories?.categories?.length}
                />
                <CardContent className="p-0">
                  {loading ? (
                    <CategoryTableSkeleton />
                  ) : (
                    <CategoryTable
                      categories={categories}
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
export default function CategoryManagement() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <CategoryManagementContent />
    </ErrorBoundary>
  );
}
