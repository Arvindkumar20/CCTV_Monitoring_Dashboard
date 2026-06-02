import React, { useEffect, useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Reusing categories from cameras hook
import { useNestedSubCategories } from "@/hooks/useNestedCategories";

export const AcademicMapping = () => {
  const { setValue, watch, formState: { errors } } = useFormContext();
  const { mainCategories, subCategories, nestedSubCategories, loading } = useNestedSubCategories();
  
  const selectedClass = watch("mainCategoryId") || "";
  const selectedSection = watch("subCategoryId") || "";
  const selectedGroup = watch("subSubCategoryId") || "";

  // Debug logs
  useEffect(() => {
    console.log("AcademicMapping - Data:", {
      mainCategories: mainCategories?.length,
      subCategories: subCategories?.length,
      nestedSubCategories: nestedSubCategories?.length,
      selectedClass,
      selectedSection
    });
  }, [mainCategories, subCategories, nestedSubCategories, selectedClass, selectedSection]);

  // Filter sections based on selected class
  const filteredSections = useMemo(() => {
    if (!selectedClass || !subCategories?.length) return [];
    
    return subCategories.filter((sub) => {
      const mainId = sub.mainCategoryId?._id || sub.mainCategoryId;
      return mainId === selectedClass;
    });
  }, [subCategories, selectedClass]);

  // Filter groups based on selected section
  const filteredGroups = useMemo(() => {
    if (!selectedSection || !nestedSubCategories?.length) return [];
    
    return nestedSubCategories.filter((group) => {
      const parentId = group.subCategoryId?._id || group.subCategoryId;
      return parentId === selectedSection;
    });
  }, [nestedSubCategories, selectedSection]);

  const handleClassChange = (value) => {
    console.log("Class selected:", value);
    setValue("mainCategoryId", value, { shouldValidate: true });
    setValue("subCategoryId", "", { shouldValidate: true });
    setValue("subSubCategoryId", "", { shouldValidate: true });
  };

  const handleSectionChange = (value) => {
    console.log("Section selected:", value);
    setValue("subCategoryId", value, { shouldValidate: true });
    setValue("subSubCategoryId", "", { shouldValidate: true });
  };

  const handleGroupChange = (value) => {
    console.log("Group selected:", value);
    setValue("subSubCategoryId", value === "none" ? "" : value, { shouldValidate: true });
  };

  // Get category name by ID
  const getCategoryName = (id, list) => {
    if (!id || !list?.length) return "";
    const item = list.find(cat => (cat._id || cat.id) === id);
    return item?.name || "";
  };

  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        Academic Mapping
      </h3>
      
      {/* Loading State */}
      {loading && (
        <div className="text-sm text-slate-400 animate-pulse">
          Loading categories...
        </div>
      )}

      {/* Error if no main categories */}
      {!loading && mainCategories?.length === 0 && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-xs">
            No classes available. Please create a class first.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Class Selection */}
        <div className="space-y-2">
          <Label htmlFor="class" className="text-xs font-semibold text-slate-600">
            Class <span className="text-red-500">*</span>
          </Label>
          <Select 
            onValueChange={handleClassChange} 
            value={selectedClass}
            disabled={loading || mainCategories?.length === 0}
          >
            <SelectTrigger
              id="class"
              className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm ${
                errors.mainCategoryId ? "border-red-500" : "border-slate-300"
              }`}
            >
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {mainCategories?.map((category) => {
                const id = category._id || category.id;
                return (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color || "#3b82f6" }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.mainCategoryId && (
            <p className="text-red-500 text-xs mt-1">{errors.mainCategoryId.message}</p>
          )}
        </div>

        {/* Section Selection */}
        <div className="space-y-2">
          <Label htmlFor="section" className="text-xs font-semibold text-slate-600">
            Section <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={handleSectionChange}
            value={selectedSection}
            disabled={!selectedClass || filteredSections.length === 0}
          >
            <SelectTrigger
              id="section"
              className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm ${
                errors.subCategoryId ? "border-red-500" : "border-slate-300"
              }`}
            >
              <SelectValue
                placeholder={
                  !selectedClass 
                    ? "Select class first" 
                    : filteredSections.length === 0
                    ? "No sections available"
                    : "Select Section"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredSections.map((section) => {
                const id = section._id || section.id;
                return (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center gap-2">
                      <span>{section.name}</span>
                      {section.description && (
                        <span className="text-xs text-slate-400">- {section.description}</span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.subCategoryId && (
            <p className="text-red-500 text-xs mt-1">{errors.subCategoryId.message}</p>
          )}
        </div>

        {/* Group Selection (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="group" className="text-xs font-semibold text-slate-600">
            Group <span className="text-slate-400 font-normal">(Optional)</span>
          </Label>
          <Select
            onValueChange={handleGroupChange}
            value={selectedGroup}
            disabled={!selectedSection}
          >
            <SelectTrigger
              id="group"
              className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm ${
                errors.subSubCategoryId ? "border-red-500" : "border-slate-300"
              }`}
            >
              <SelectValue
                placeholder={
                  !selectedSection 
                    ? "Select section first" 
                    : filteredGroups.length === 0
                    ? "No groups available"
                    : "Select Group"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {filteredGroups.map((group) => {
                const id = group._id || group.id;
                return (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center gap-2">
                      <span>{group.name}</span>
                      {group.description && (
                        <span className="text-xs text-slate-400">- {group.description}</span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Path Display */}
      {selectedClass && (
        <div className="mt-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
          <span className="font-medium">Selected: </span>
          {getCategoryName(selectedClass, mainCategories)}
          {selectedSection && (
            <> → {getCategoryName(selectedSection, subCategories)}</>
          )}
          {selectedGroup && selectedGroup !== "none" && (
            <> → {getCategoryName(selectedGroup, nestedSubCategories)}</>
          )}
        </div>
      )}
    </div>
  );
};

// Skeleton
export const AcademicMappingSkeleton = () => (
  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-10 bg-slate-200 rounded-lg animate-pulse" />
      <div className="h-10 bg-slate-200 rounded-lg animate-pulse" />
      <div className="h-10 bg-slate-200 rounded-lg animate-pulse" />
    </div>
  </div>
);