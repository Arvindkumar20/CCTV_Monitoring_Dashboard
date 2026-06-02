// pages/NestedCategoryManagement.jsx
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw } from "lucide-react";

import AdminLayout from "@/components/layout/AdminLayout";
import { BackButton } from "@/components/common/BackButton";
import {
  NestedSubCategoryForm,
  NestedSubCategoryFormSkeleton,
} from "@/adminDashboard/nested-subcategory/NestedSubCategoryForm";
import {
  NestedCategoryTable,
  NestedCategoryTableSkeleton,
} from "@/adminDashboard/nested-subcategory/NestedCategoryTable";
import { useNestedSubCategories } from "@/hooks/useNestedCategories";
 // Fixed import name

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

function NestedCategoryManagementContent() {
  const {
    // Fix: Use correct property names from the hook
    nestedSubCategories = [], // Changed from categories
    mainCategories = [],
    subCategories = [],
    loading,
    isSubmitting,
    addNestedSubCategory, // Changed from addCategory
    updateNestedSubCategory, // Changed from editCategory
    deleteNestedSubCategory, // Changed from removeCategory
    getSubCategoriesByMainCategory,
    refresh,
  } = useNestedSubCategories();

  const [editingCategory, setEditingCategory] = useState(null);
  const [preSelectedParent, setPreSelectedParent] = useState(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
// console.log(nestedSubCategories)
  // Get available sub categories based on selected main category
  const availableSubCategories = selectedMainCategory 
    ? getSubCategoriesByMainCategory(selectedMainCategory)
    : subCategories;

  const handleFormSubmit = async (data) => {
    // console.log(data)
    // Format data for API
    const formattedData = {
      name: data.name,
      description: data.description || '',
      parentId: data.parentId,
      mainCategoryId: data.mainCategoryId,
      subCategoryId:data.subCategoryId,
      color: data.color,
      icon: data.icon,
    };
console.log(data)
    if (editingCategory) {
      const success = await updateNestedSubCategory(editingCategory.id || editingCategory._id, formattedData);
      if (success) {
        setEditingCategory(null);
        setPreSelectedParent(null);
        setSelectedMainCategory(null);
      }
    } else {
      const success = await addNestedSubCategory(formattedData);
      if (success) {
        setPreSelectedParent(null);
        setSelectedMainCategory(null);
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setPreSelectedParent(null);
    // Set selected main category based on the category being edited
    if (category.mainCategoryId) {
      setSelectedMainCategory(
        typeof category.mainCategoryId === 'object' 
          ? category.mainCategoryId._id 
          : category.mainCategoryId
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddSubCategory = (parent) => {
    setPreSelectedParent(parent);
    setEditingCategory(null);
    // Set selected main category based on parent
    if (parent.mainCategoryId) {
      setSelectedMainCategory(
        typeof parent.mainCategoryId === 'object'
          ? parent.mainCategoryId._id
          : parent.mainCategoryId
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await deleteNestedSubCategory(id);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setPreSelectedParent(null);
    setSelectedMainCategory(null);
  };

  const handleMainCategoryChange = (mainCategoryId) => {
    setSelectedMainCategory(mainCategoryId);
    // Clear parent selection if it doesn't belong to new main category
    if (preSelectedParent) {
      const parentMainCatId = typeof preSelectedParent.mainCategoryId === 'object'
        ? preSelectedParent.mainCategoryId._id
        : preSelectedParent.mainCategoryId;
      
      if (parentMainCatId !== mainCategoryId) {
        setPreSelectedParent(null);
      }
    }
  };

  // Prepare initial data for form
  const getInitialFormData = () => {
    if (editingCategory) {
      return {
        id: editingCategory.id || editingCategory._id,
        name: editingCategory.name,
        description: editingCategory.description || '',
        parentId: editingCategory.parentId?._id || editingCategory.parentId,
        mainCategoryId: editingCategory.mainCategoryId?._id || editingCategory.mainCategoryId,
        color: editingCategory.color,
        icon: editingCategory.icon,
      };
    }
    if (preSelectedParent) {
      return { 
        parentId: preSelectedParent.id || preSelectedParent._id,
        mainCategoryId: preSelectedParent.mainCategoryId?._id || preSelectedParent.mainCategoryId,
      };
    }
    return null;
  };

  const initialData = getInitialFormData();

  // Get display name for the form header
  const getFormHeaderText = () => {
    if (editingCategory) return "Edit Nested Sub Category";
    if (preSelectedParent) {
      return `Add Nested Sub Category under ${preSelectedParent.name}`;
    }
    return "Create New Nested Sub Category";
  };

  // Get form description
  const getFormDescription = () => {
    if (editingCategory) return "Update nested sub category details";
    if (preSelectedParent) {
      return `Creating Level ${(preSelectedParent.level || 0) + 1} nested sub category`;
    }
    return "Create a new nested sub category under a sub category";
  };

  return (
    <AdminLayout>
      <div className="bg-slate-50 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <BackButton
              to="/dashboard"
              label="Back to Dashboard"
            />
            {/* <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Side: Form */}
            <div className="lg:col-span-5">
              <Card className="sticky top-8 border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 bg-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">
                        {getFormHeaderText()}
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-1">
                        {getFormDescription()}
                      </p>
                    </div>
                    {(editingCategory || preSelectedParent) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {loading ? (
                    <NestedSubCategoryFormSkeleton />
                  ) : (
                    <NestedSubCategoryForm
                      categories={nestedSubCategories} // Pass nested sub categories
                      mainCategories={mainCategories}
                      subCategories={availableSubCategories}
                      onSubmit={handleFormSubmit}
                      isSubmitting={isSubmitting}
                      initialData={initialData}
                      onMainCategoryChange={handleMainCategoryChange}
                      setSelectedMainCategory={setSelectedMainCategory}
                      selectedMainCategory={selectedMainCategory}
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
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">
                        Nested Sub Categories Hierarchy
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-1">
                        Manage your nested sub categories under main categories and sub categories
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600"
                    >
                      Total: {nestedSubCategories?.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <NestedCategoryTableSkeleton />
                  ) : (
                    <NestedCategoryTable
                      categories={nestedSubCategories}
                      mainCategories={mainCategories}
                      subCategories={subCategories}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAddSubCategory={handleAddSubCategory}
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
export default function NestedCategoryManagement() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <NestedCategoryManagementContent />
    </ErrorBoundary>
  );
}