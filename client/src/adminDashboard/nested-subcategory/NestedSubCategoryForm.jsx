// // components/nested-subcategory/NestedSubCategoryForm.jsx
// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Save, Loader2, ChevronRight } from "lucide-react";

// // Validation schema
// const nestedSubCategorySchema = z.object({
//   subCategoryId: z.string().min(1, "Please select a parent sub category"),
//   mainCategoryId: z.string().min(1, "Please select a main category"),
//   name: z
//     .string()
//     .min(1, "Nested sub category name is required")
//     .min(2, "Name must be at least 2 characters")
//     .max(100, "Name cannot exceed 100 characters"),
//   description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
//   parentNestedId: z.string().optional().nullable(),
//   color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
//   icon: z.string().optional(),
// });

// // Placeholder value for "none" selection - using a unique string that won't conflict with real IDs
// const NONE_VALUE = "none";

// export const NestedSubCategoryForm = ({
//   categories = [], // Nested sub categories
//   mainCategories = [],
//   subCategories = [],
//   onSubmit,
//   isSubmitting = false,
//   initialData = null,
//   onMainCategoryChange,
//   selectedMainCategory: externalSelectedMainCategory,
// }) => {
//   const [selectedPath, setSelectedPath] = useState([]);
//   const [filteredSubCategories, setFilteredSubCategories] = useState([]);
//   const [filteredNestedCategories, setFilteredNestedCategories] = useState([]);
  
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//     watch,
//   } = useForm({
//     resolver: zodResolver(nestedSubCategorySchema),
//     defaultValues: {
//       subCategoryId: "",
//       mainCategoryId: "",
//       name: "",
//       description: "",
//       color: "#3b82f6",
//       icon: "folder",
//     },
//   });

//   // Watch values
//   const selectedMainCategory = watch("mainCategoryId");
//   const selectedSubCategory = watch("subCategoryId");

//   // Filter sub categories based on selected main category
//   useEffect(() => {
//     if (selectedMainCategory) {
//       const filtered = subCategories.filter(sub => {
//         const subMainId = sub.mainCategoryId?._id || sub.mainCategoryId;
//         return String(subMainId) === String(selectedMainCategory);
//       });
//       setFilteredSubCategories(filtered);
      
//       // Notify parent
//       if (onMainCategoryChange) {
//         onMainCategoryChange(selectedMainCategory);
//       }
//     } else {
//       setFilteredSubCategories([]);
//     }
//   }, [selectedMainCategory, subCategories, onMainCategoryChange]);

//   // Filter nested categories based on selected sub category
//   useEffect(() => {
//     if (selectedSubCategory) {
//       const filtered = categories.filter(cat => {
//         const catSubId = cat.subCategoryId?._id || cat.subCategoryId;
//         return String(catSubId) === String(selectedSubCategory);
//       });
//       setFilteredNestedCategories(filtered);
//     } else {
//       setFilteredNestedCategories([]);
//     }
//   }, [selectedSubCategory, categories]);

//   // Populate form when editing
//   useEffect(() => {
//     if (initialData) {
//       // Extract IDs properly
//       const mainId = initialData.mainCategoryId?._id || initialData.mainCategoryId;
//       const subId = initialData.subCategoryId?._id || initialData.subCategoryId;
      
//       setValue("mainCategoryId", mainId || "");
//       setValue("subCategoryId", subId || "");
//       setValue("name", initialData.name || "");
//       setValue("description", initialData.description || "");
//       setValue("color", initialData.color || "#3b82f6");
//       setValue("icon", initialData.icon || "folder");
      
//       // Build path after setting values
//       if (subId) {
//         setTimeout(() => {
//           buildPath(subId, parentNestedId);
//         }, 100);
//       }
//     } else {
//       reset();
//       setSelectedPath([]);
//     }
//   }, [initialData, setValue, reset]);

//   // Build path when selections change
//   useEffect(() => {
//     if (selectedSubCategory ) {
//       buildPath(selectedSubCategory);
//     } else {
//       setSelectedPath([]);
//     }
//   }, [selectedSubCategory]);

//   // Path builder function
//   const buildPath = (subCategoryId) => {
//     const path = [];

//     // Add main category if available
//     if (selectedMainCategory) {
//       const mainCat = mainCategories.find(m => 
//         String(m._id || m.id) === String(selectedMainCategory)
//       );
//       if (mainCat) {
//         path.push({
//           id: mainCat._id || mainCat.id,
//           name: mainCat.name,
//           type: 'main',
//           color: mainCat.color
//         });
//       }
//     }

//     // Add sub category
//     if (subCategoryId && subCategoryId !== NONE_VALUE) {
//       const subCat = subCategories.find(s => 
//         String(s._id || s.id) === String(subCategoryId)
//       );
//       if (subCat) {
//         path.push({
//           id: subCat._id || subCat.id,
//           name: subCat.name,
//           type: 'sub',
//           color: subCat.color
//         });
//       }
//     }

  

//     setSelectedPath(path);
//   };

//   const handleFormSubmit = (data) => {
//     // Format data for API - convert "none" to null
//     const submitData = {
//       name: data.name,
//       description: data.description || "",
//       subCategoryId: data.subCategoryId,
//       mainCategoryId: data.mainCategoryId,
//       color: data.color || "#3b82f6",
//       icon: data.icon || "folder",
//     };
    
//     onSubmit(submitData);
    
//     if (!initialData) {
//       reset();
//       setSelectedPath([]);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
//       {/* Main Category Select */}
//       <div className="space-y-2">
//         <Label htmlFor="mainCategoryId" className="text-sm font-semibold text-slate-700">
//           Select Main Category <span className="text-red-500">*</span>
//         </Label>
//         <Select
//           value={selectedMainCategory || undefined}
//           onValueChange={(value) => {
//             setValue("mainCategoryId", value);
//             setValue("subCategoryId", ""); // Reset sub category
    
//           }}
//         >
//           <SelectTrigger
//             id="mainCategoryId"
//             className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
//               errors.mainCategoryId ? "border-red-500" : "border-slate-300"
//             }`}
//           >
//             <SelectValue placeholder="Choose Main Category..." />
//           </SelectTrigger>
//           <SelectContent>
//             {mainCategories.map((category) => {
//               const catId = category._id || category.id;
//               return (
//                 <SelectItem key={catId} value={catId}>
//                   <div className="flex items-center space-x-2">
//                     <span
//                       className="w-2 h-2 rounded-full"
//                       style={{ backgroundColor: category.color || "#3b82f6" }}
//                     />
//                     <span>{category.name}</span>
//                   </div>
//                 </SelectItem>
//               );
//             })}
//           </SelectContent>
//         </Select>
//         {errors.mainCategoryId && (
//           <p className="text-red-500 text-xs mt-1.5 font-medium">
//             {errors.mainCategoryId.message}
//           </p>
//         )}
//       </div>

//       {/* Sub Category Select */}
//       <div className="space-y-2">
//         <Label htmlFor="subCategoryId" className="text-sm font-semibold text-slate-700">
//           Select Parent Sub Category <span className="text-red-500">*</span>
//         </Label>
        
//         <Select
//           value={selectedSubCategory || undefined}
//           onValueChange={(value) => {
//             setValue("subCategoryId", value);
//           }}
//           disabled={!selectedMainCategory}
//         >
//           <SelectTrigger
//             id="subCategoryId"
//             className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
//               errors.subCategoryId ? "border-red-500" : "border-slate-300"
//             }`}
//           >
//             <SelectValue placeholder={
//               !selectedMainCategory 
//                 ? "First select a main category" 
//                 : "Choose Parent Sub Category..."
//             } />
//           </SelectTrigger>
//           <SelectContent className="max-h-80">
//             {filteredSubCategories.length > 0 ? (
//               filteredSubCategories.map((subCategory) => {
//                 const subId = subCategory._id || subCategory.id;
//                 return (
//                   <SelectItem key={subId} value={subId}>
//                     <div className="flex items-center space-x-2">
//                       <span
//                         className="w-2 h-2 rounded-full"
//                         style={{ backgroundColor: subCategory.color || "#3b82f6" }}
//                       />
//                       <span className="font-medium">{subCategory.name}</span>
//                       {subCategory.description && (
//                         <span className="text-xs text-slate-400 ml-1">
//                           ({subCategory.description})
//                         </span>
//                       )}
//                     </div>
//                   </SelectItem>
//                 );
//               })
//             ) : (
//               <div className="p-3 text-sm text-center text-slate-400">
//                 No sub categories found for this main category
//               </div>
//             )}
//           </SelectContent>
//         </Select>
//         {errors.subCategoryId && (
//           <p className="text-red-500 text-xs mt-1.5 font-medium">
//             {errors.subCategoryId.message}
//           </p>
//         )}
//       </div>

//       {/* Parent Nested Category Select (Optional) */}
     

//       {/* Path Display */}
//       {selectedPath.length > 0 && (
//         <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
//           <p className="text-xs text-slate-500 mb-2">Full Path:</p>
//           <div className="flex items-center flex-wrap gap-1">
//             {selectedPath.map((item, index) => (
//               <React.Fragment key={`${item.type}-${item.id}`}>
//                 <span 
//                   className="px-2 py-0.5 rounded-full text-xs font-medium"
//                   style={{
//                     backgroundColor: item.color ? `${item.color}20` : '#f1f5f9',
//                     color: item.color || '#475569',
//                   }}
//                 >
//                   {item.type === 'main' && '📁 '}
//                   {item.type === 'sub' && '📂 '}
//                   {item.type === 'nested' && '📄 '}
//                   {item.name}
//                 </span>
//                 {index < selectedPath.length - 1 && (
//                   <ChevronRight className="w-3 h-3 text-slate-400" />
//                 )}
//               </React.Fragment>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Name Input */}
//       <div className="space-y-2">
//         <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
//           Nested Sub Category Name <span className="text-red-500">*</span>
//         </Label>
//         <Input
//           id="name"
//           placeholder="e.g. Morning Batch, Section A-1"
//           {...register("name")}
//           className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
//             errors.name ? "border-red-500" : "border-slate-300"
//           }`}
//         />
//         {errors.name && (
//           <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>
//         )}
//       </div>

//       {/* Description */}
//       <div className="space-y-2">
//         <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
//           Description <span className="text-slate-400 font-normal">(Optional)</span>
//         </Label>
//         <Textarea
//           id="description"
//           rows="2"
//           placeholder="Enter details about this nested sub category..."
//           {...register("description")}
//           className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
//         />
//       </div>

//       {/* Hidden fields for color and icon */}
//       <input type="hidden" {...register("color")} />
//       <input type="hidden" {...register("icon")} />

//       <Button
//         type="submit"
//         disabled={isSubmitting}
//         className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
//       >
//         {isSubmitting ? (
//           <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
//         ) : (
//           <><Save className="w-4 h-4 mr-2" /> {initialData ? "Update" : "Save"} Nested Sub Category</>
//         )}
//       </Button>
//     </form>
//   );
// };

// // Form Skeleton
// export const NestedSubCategoryFormSkeleton = () => (
//   <div className="space-y-5">
//     {[1, 2, 3, 4].map((i) => (
//       <div key={i} className="space-y-2">
//         <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
//         <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
//       </div>
//     ))}
//     <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
//   </div>
// );



// components/nested-subcategory/NestedSubCategoryForm.jsx
import React, { useEffect, useState } from "react";
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
import { Save, Loader2, ChevronRight } from "lucide-react";

// Validation schema
const nestedSubCategorySchema = z.object({
  subCategoryId: z.string().min(1, "Please select a parent sub category"),
  mainCategoryId: z.string().min(1, "Please select a main category"),
  name: z
    .string()
    .min(1, "Nested sub category name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  parentNestedId: z.string().optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
  icon: z.string().optional(),
});

// Placeholder value for "none" selection - using a unique string that won't conflict with real IDs
const NONE_VALUE = "none";
const EMPTY_VALUE = ""; // Use empty string as the uncontrolled/controlled consistent value

export const NestedSubCategoryForm = ({
  categories = [], // Nested sub categories
  mainCategories = [],
  subCategories = [],
  onSubmit,
  isSubmitting = false,
  initialData = null,
  onMainCategoryChange,
  selectedMainCategory: externalSelectedMainCategory,
}) => {
  const [selectedPath, setSelectedPath] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredNestedCategories, setFilteredNestedCategories] = useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm({
    resolver: zodResolver(nestedSubCategorySchema),
    defaultValues: {
      subCategoryId: "",
      mainCategoryId: "",
      name: "",
      description: "",
      color: "#3b82f6",
      icon: "folder",
    },
  });

  // Watch values
  const selectedMainCategory = watch("mainCategoryId");
  const selectedSubCategory = watch("subCategoryId");

  // Filter sub categories based on selected main category
  useEffect(() => {
    if (selectedMainCategory && selectedMainCategory !== EMPTY_VALUE) {
      const filtered = subCategories.filter(sub => {
        const subMainId = sub.mainCategoryId?._id || sub.mainCategoryId;
        return String(subMainId) === String(selectedMainCategory);
      });
      setFilteredSubCategories(filtered);
      
      // Notify parent
      if (onMainCategoryChange) {
        onMainCategoryChange(selectedMainCategory);
      }
    } else {
      setFilteredSubCategories([]);
      // Reset sub category when main category is cleared
      if (getValues("subCategoryId") !== EMPTY_VALUE) {
        setValue("subCategoryId", EMPTY_VALUE);
      }
    }
  }, [selectedMainCategory, subCategories, onMainCategoryChange, setValue, getValues]);

  // Filter nested categories based on selected sub category
  useEffect(() => {
    if (selectedSubCategory && selectedSubCategory !== EMPTY_VALUE) {
      const filtered = categories.filter(cat => {
        const catSubId = cat.subCategoryId?._id || cat.subCategoryId;
        return String(catSubId) === String(selectedSubCategory);
      });
      setFilteredNestedCategories(filtered);
    } else {
      setFilteredNestedCategories([]);
    }
  }, [selectedSubCategory, categories]);

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      // Extract IDs properly
      const mainId = initialData.mainCategoryId?._id || initialData.mainCategoryId;
      const subId = initialData.subCategoryId?._id || initialData.subCategoryId;
      
      // Use empty string as fallback to maintain controlled state
      setValue("mainCategoryId", mainId || EMPTY_VALUE);
      setValue("subCategoryId", subId || EMPTY_VALUE);
      setValue("name", initialData.name || "");
      setValue("description", initialData.description || "");
      setValue("color", initialData.color || "#3b82f6");
      setValue("icon", initialData.icon || "folder");
      
      // Build path after setting values
      if (subId) {
        setTimeout(() => {
          buildPath(subId);
        }, 100);
      }
    } else {
      // Reset to empty strings to maintain controlled state
      reset({
        subCategoryId: EMPTY_VALUE,
        mainCategoryId: EMPTY_VALUE,
        name: "",
        description: "",
        color: "#3b82f6",
        icon: "folder",
      });
      setSelectedPath([]);
    }
  }, [initialData, setValue, reset]);

  // Build path when selections change
  useEffect(() => {
    if (selectedSubCategory && selectedSubCategory !== EMPTY_VALUE) {
      buildPath(selectedSubCategory);
    } else {
      setSelectedPath([]);
    }
  }, [selectedSubCategory, selectedMainCategory]);

  // Path builder function
  const buildPath = (subCategoryId) => {
    const path = [];

    // Add main category if available
    if (selectedMainCategory && selectedMainCategory !== EMPTY_VALUE) {
      const mainCat = mainCategories.find(m => 
        String(m._id || m.id) === String(selectedMainCategory)
      );
      if (mainCat) {
        path.push({
          id: mainCat._id || mainCat.id,
          name: mainCat.name,
          type: 'main',
          color: mainCat.color
        });
      }
    }

    // Add sub category
    if (subCategoryId && subCategoryId !== EMPTY_VALUE && subCategoryId !== NONE_VALUE) {
      const subCat = subCategories.find(s => 
        String(s._id || s.id) === String(subCategoryId)
      );
      if (subCat) {
        path.push({
          id: subCat._id || subCat.id,
          name: subCat.name,
          type: 'sub',
          color: subCat.color
        });
      }
    }

    setSelectedPath(path);
  };

  const handleFormSubmit = (data) => {
    // Format data for API - convert empty strings to appropriate values
    const submitData = {
      name: data.name,
      description: data.description || "",
      subCategoryId: data.subCategoryId === EMPTY_VALUE ? null : data.subCategoryId,
      mainCategoryId: data.mainCategoryId === EMPTY_VALUE ? null : data.mainCategoryId,
      color: data.color || "#3b82f6",
      icon: data.icon || "folder",
    };
    
    onSubmit(submitData);
    
    if (!initialData) {
      // Reset to empty strings to maintain controlled state
      reset({
        subCategoryId: EMPTY_VALUE,
        mainCategoryId: EMPTY_VALUE,
        name: "",
        description: "",
        color: "#3b82f6",
        icon: "folder",
      });
      setSelectedPath([]);
    }
  };

  // Helper function to get select value (never undefined)
  const getSelectValue = (value) => {
    return value || EMPTY_VALUE;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Main Category Select */}
      <div className="space-y-2">
        <Label htmlFor="mainCategoryId" className="text-sm font-semibold text-slate-700">
          Select Main Category <span className="text-red-500">*</span>
        </Label>
        <Select
          value={getSelectValue(selectedMainCategory)}
          onValueChange={(value) => {
            setValue("mainCategoryId", value);
            setValue("subCategoryId", EMPTY_VALUE); // Reset sub category
          }}
        >
          <SelectTrigger
            id="mainCategoryId"
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
              errors.mainCategoryId ? "border-red-500" : "border-slate-300"
            }`}
          >
            <SelectValue placeholder="Choose Main Category..." />
          </SelectTrigger>
          <SelectContent>
            {mainCategories.length > 0 ? (
              mainCategories.map((category) => {
                const catId = category._id || category.id;
                return (
                  <SelectItem key={catId} value={catId}>
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color || "#3b82f6" }}
                      />
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                );
              })
            ) : (
              <div className="p-3 text-sm text-center text-slate-400">
                No main categories available
              </div>
            )}
          </SelectContent>
        </Select>
        {errors.mainCategoryId && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">
            {errors.mainCategoryId.message}
          </p>
        )}
      </div>

      {/* Sub Category Select */}
      <div className="space-y-2">
        <Label htmlFor="subCategoryId" className="text-sm font-semibold text-slate-700">
          Select Parent Sub Category <span className="text-red-500">*</span>
        </Label>
        
        <Select
          value={getSelectValue(selectedSubCategory)}
          onValueChange={(value) => {
            setValue("subCategoryId", value);
          }}
          disabled={!selectedMainCategory || selectedMainCategory === EMPTY_VALUE}
        >
          <SelectTrigger
            id="subCategoryId"
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
              errors.subCategoryId ? "border-red-500" : "border-slate-300"
            }`}
          >
            <SelectValue placeholder={
              !selectedMainCategory || selectedMainCategory === EMPTY_VALUE
                ? "First select a main category" 
                : "Choose Parent Sub Category..."
            } />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {filteredSubCategories.length > 0 ? (
              filteredSubCategories.map((subCategory) => {
                const subId = subCategory._id || subCategory.id;
                return (
                  <SelectItem key={subId} value={subId}>
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: subCategory.color || "#3b82f6" }}
                      />
                      <span className="font-medium">{subCategory.name}</span>
                      {subCategory.description && (
                        <span className="text-xs text-slate-400 ml-1">
                          ({subCategory.description})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })
            ) : (
              <div className="p-3 text-sm text-center text-slate-400">
                {!selectedMainCategory || selectedMainCategory === EMPTY_VALUE
                  ? "Select a main category first"
                  : "No sub categories found for this main category"
                }
              </div>
            )}
          </SelectContent>
        </Select>
        {errors.subCategoryId && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">
            {errors.subCategoryId.message}
          </p>
        )}
      </div>

      {/* Path Display */}
      {selectedPath.length > 0 && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Full Path:</p>
          <div className="flex items-center flex-wrap gap-1">
            {selectedPath.map((item, index) => (
              <React.Fragment key={`${item.type}-${item.id}`}>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: item.color ? `${item.color}20` : '#f1f5f9',
                    color: item.color || '#475569',
                  }}
                >
                  {item.type === 'main' && '📁 '}
                  {item.type === 'sub' && '📂 '}
                  {item.type === 'nested' && '📄 '}
                  {item.name}
                </span>
                {index < selectedPath.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
          Nested Sub Category Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. Morning Batch, Section A-1"
          {...register("name")}
          className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${
            errors.name ? "border-red-500" : "border-slate-300"
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name.message}</p>
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
          placeholder="Enter details about this nested sub category..."
          {...register("description")}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {/* Hidden fields for color and icon */}
      <input type="hidden" {...register("color")} />
      <input type="hidden" {...register("icon")} />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
        ) : (
          <><Save className="w-4 h-4 mr-2" /> {initialData ? "Update" : "Save"} Nested Sub Category</>
        )}
      </Button>
    </form>
  );
};

// Form Skeleton
export const NestedSubCategoryFormSkeleton = () => (
  <div className="space-y-5">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    ))}
    <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
  </div>
);