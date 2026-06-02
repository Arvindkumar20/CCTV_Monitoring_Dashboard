// components/camera/AddCameraForm/HierarchySelector.jsx (Fixed)
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FolderTree, X } from "lucide-react";

export const HierarchySelector = ({
  mainCategories = [],
  subCategories = [],
  nestedSubCategories = [],
  onMainCategoryChange,
  onSubCategoryChange,
}) => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  // Watch form values
  const selectedMain = watch("mainCategoryId") || "";
  const selectedSub = watch("subCategoryId") || "";
  const selectedNested = watch("nestedSubCategoryId") || "";
console.log(mainCategories)
  // Filter sub categories based on selected main category
  const filteredSubCategories = React.useMemo(() => {
    if (!selectedMain || !subCategories.length) return [];
    
    return subCategories.filter((sub) => {
      const subMainId = sub.mainCategoryId?._id || sub.mainCategoryId;
      return String(subMainId) === String(selectedMain);
    });
  }, [selectedMain, subCategories]);

  // Filter nested sub categories based on selected sub category
  const filteredNestedSubCategories = React.useMemo(() => {
    if (!selectedSub || !nestedSubCategories.length) return [];
    
    return nestedSubCategories.filter((nested) => {
      const nestedSubId = nested.subCategoryId?._id || nested.subCategoryId;
      return String(nestedSubId) === String(selectedSub);
    });
  }, [selectedSub, nestedSubCategories]);

  const handleMainChange = (value) => {
    setValue("mainCategoryId", value);
    setValue("subCategoryId", ""); // Reset sub
    setValue("nestedSubCategoryId", ""); // Reset nested
    onMainCategoryChange?.(value);
  };

  const handleSubChange = (value) => {
    setValue("subCategoryId", value);
    setValue("nestedSubCategoryId", ""); // Reset nested
    onSubCategoryChange?.(value);
  };

  const handleNestedChange = (value) => {
    // Handle "none" option - use null or undefined instead of empty string
    if (value === "none") {
      setValue("nestedSubCategoryId", null);
    } else {
      setValue("nestedSubCategoryId", value);
    }
  };

  const clearNestedSelection = () => {
    setValue("nestedSubCategoryId", null);
  };

  // Get selected category names for display
  const selectedMainCat = mainCategories.find(
    (c) => String(c._id || c.id) === String(selectedMain)
  );
  
  const selectedSubCat = subCategories.find(
    (c) => String(c._id || c.id) === String(selectedSub)
  );
  
  const selectedNestedCat = nestedSubCategories.find(
    (c) => String(c._id || c.id) === String(selectedNested)
  );

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-700">
            Category Hierarchy
          </h3>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
          Link Camera to Categories
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Category */}
        <div className="space-y-2">
          <Label htmlFor="mainCategory" className="text-xs font-semibold text-slate-600">
            Main Category <span className="text-red-500">*</span>
          </Label>
          <Select onValueChange={handleMainChange} value={selectedMain || undefined}>
            <SelectTrigger
              id="mainCategory"
              className={`w-full bg-white border ${
                errors.mainCategoryId ? "border-red-500 ring-1 ring-red-100" : "border-slate-200"
              } rounded-lg text-sm hover:bg-slate-50 transition-colors`}
            >
              <SelectValue placeholder="Choose main category..." />
            </SelectTrigger>
            <SelectContent>
              {mainCategories.length === 0 ? (
                <div className="p-2 text-sm text-slate-500 text-center">
                  No categories available
                </div>
              ) : (
                mainCategories.map((category) => {
                  const categoryId = category._id || category.id;
                  return (
                    <SelectItem key={categoryId} value={categoryId}>
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category.color || "#3b82f6" }}
                        />
                        <span>{category.name}</span>
                        {category.description && (
                          <span className="text-xs text-slate-400 ml-1">
                            ({category.description})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
          {errors.mainCategoryId && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <span className="text-red-400">●</span>
              {errors.mainCategoryId.message}
            </p>
          )}
        </div>

        {/* Sub Category */}
        <div className="space-y-2">
          <Label htmlFor="subCategory" className="text-xs font-semibold text-slate-600">
            Sub Category <span className="text-slate-400 font-normal">(Optional)</span>
          </Label>
          <Select
            onValueChange={handleSubChange}
            value={selectedSub || undefined}
            disabled={!selectedMain}
          >
            <SelectTrigger
              id="subCategory"
              className={`w-full bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors ${
                !selectedMain ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <SelectValue
                placeholder={
                  selectedMain 
                    ? filteredSubCategories.length > 0 
                      ? "Choose sub category..." 
                      : "No sub categories available"
                    : "Select main category first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredSubCategories.length === 0 ? (
                <div className="p-2 text-sm text-slate-500 text-center">
                  {selectedMain ? "No sub categories found" : "Select main category first"}
                </div>
              ) : (
                filteredSubCategories.map((sub) => {
                  const subId = sub._id || sub.id;
                  return (
                    <SelectItem key={subId} value={subId}>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span>{sub.name}</span>
                        {sub.description && (
                          <span className="text-xs text-slate-400">
                            ({sub.description})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Nested Sub Category (Level 3) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="nestedSubCategory"
              className="text-xs font-semibold text-slate-600"
            >
              Nested Sub Category{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            {selectedNested && (
              <button
                type="button"
                onClick={clearNestedSelection}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          <Select
            onValueChange={handleNestedChange}
            value={selectedNested || undefined}
            disabled={!selectedSub}
          >
            <SelectTrigger
              id="nestedSubCategory"
              className={`w-full bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors ${
                !selectedSub ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <SelectValue
                placeholder={
                  selectedSub
                    ? filteredNestedSubCategories.length > 0
                      ? "Choose nested category..."
                      : "No nested categories"
                    : "Select sub category first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {/* "None" option with a non-empty string value */}
              <SelectItem value="none">
                <div className="flex items-center space-x-2 text-slate-500">
                  <span className="text-xs">—</span>
                  <span>None (Skip nested category)</span>
                </div>
              </SelectItem>
              
              {filteredNestedSubCategories.length > 0 ? (
                filteredNestedSubCategories.map((nested) => {
                  const nestedId = nested._id || nested.id;
                  return (
                    <SelectItem key={nestedId} value={nestedId}>
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                        <span>{nested.name}</span>
                        {nested.description && (
                          <span className="text-xs text-slate-400">
                            ({nested.description})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              ) : (
                selectedSub && (
                  <div className="p-2 text-sm text-slate-500 text-center">
                    No nested categories available
                  </div>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selection Summary - Shows the full hierarchy path */}
      {(selectedMainCat || selectedSubCat || selectedNestedCat) && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
            Selected Hierarchy Path:
          </p>
          <div className="flex items-center flex-wrap gap-2">
            {selectedMainCat && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-xs font-medium"
              >
                <span className="mr-1">📁</span>
                {selectedMainCat.name}
              </Badge>
            )}
            
            {selectedSubCat && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 text-xs font-medium"
                >
                  <span className="mr-1">📂</span>
                  {selectedSubCat.name}
                </Badge>
              </>
            )}
            
            {selectedNestedCat && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-xs font-medium"
                >
                  <span className="mr-1">📄</span>
                  {selectedNestedCat.name}
                </Badge>
              </>
            )}

            {selectedSubCat && !selectedNestedCat && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-500 border-slate-200 px-3 py-1 text-xs"
                >
                  No nested category
                </Badge>
              </>
            )}
          </div>
        </div>
      )}

      {/* Helper text */}
      <div className="text-xs text-slate-400 flex items-center gap-1 mt-2">
        <span className="text-blue-500">●</span>
        Main category is required. Sub and nested categories are optional for deeper hierarchy.
      </div>
    </div>
  );
};

// Enhanced Skeleton
export const HierarchySelectorSkeleton = () => (
  <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 space-y-5">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
    
    <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
      <div className="h-3 w-32 bg-slate-200 rounded animate-pulse mb-3" />
      <div className="flex items-center gap-2">
        <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-3 w-3 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);