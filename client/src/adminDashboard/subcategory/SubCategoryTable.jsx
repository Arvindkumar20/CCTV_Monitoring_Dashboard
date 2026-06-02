// components/subcategory/SubCategoryTable.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";

// Category badge colors mapping
const categoryColors = {
  "10th Class": "bg-blue-50 text-blue-600 border-blue-100",
  "12th Class": "bg-purple-50 text-purple-600 border-purple-100",
  "Staff Office": "bg-amber-50 text-amber-600 border-amber-100",
  default: "bg-slate-50 text-slate-600 border-slate-100",
};

export const SubCategoryTable = ({
  subCategories = [],
  mainCategories = [],
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [deleteId, setDeleteId] = useState(null);
// console.log(subCategories)
  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const getCategoryBadgeClass = (categoryName) => {
    return categoryColors[categoryName] || categoryColors.default;
  };

  if (subCategories.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-slate-300 text-4xl mb-3">
          <i className="fas fa-layer-group"></i>
        </div>
        <p className="text-slate-500 font-medium">No sub categories created yet.</p>
        <p className="text-slate-400 text-sm mt-1">
          Create your first sub category to organize sections.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Main Category
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sub Category
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.map((subCat) => {
              const mainCategory = mainCategories?.find(
                (cat) => cat._id === subCat.mainCategoryId._id
              );
              // console.log(mainCategory)
              return (
                <TableRow
                  key={subCat.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 text-xs font-medium border ${getCategoryBadgeClass(
                        mainCategory?._id

                      )}`}
                    >
                      {mainCategory?.name }
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    <div>
                      {subCat.name}
                      {subCat.description && (
                        <p className="text-xs text-slate-500 mt-0.5 font-normal italic">
                          {subCat.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(subCat)}
                        className="text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(subCat._id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sub
              category and may affect associated cameras and guardians.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Table Skeleton
export const SubCategoryTableSkeleton = () => (
  <div className="divide-y divide-slate-100">
    <div className="px-6 py-4 flex items-center space-x-4 bg-slate-50">
      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse ml-auto" />
    </div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="px-6 py-4 flex items-center space-x-4">
        <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
          <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);