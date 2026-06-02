// components/category/CategoryTable.jsx
import React from "react";
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

export const CategoryTable = ({ categories, onEdit, onDelete, isLoading = false }) => {
  const [deleteId, setDeleteId] = React.useState(null);
console.log(categories)
  const handleDeleteClick = (id) => {
    console.log("object")
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    console.log("object")
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (!categories.categories?.length ) {
    return (
      <div className="p-12 text-center">
        <div className="text-slate-300 text-4xl mb-3">
          <i className="fas fa-folder-open"></i>
        </div>
        <p className="text-slate-500 font-medium">No categories created yet.</p>
        <p className="text-slate-400 text-sm mt-1">Create your first category to get started.</p>
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
                Category Name
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Description
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.categories?.length>0&&categories.categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-semibold text-slate-700">
                  {category.name}
                </TableCell>
                <TableCell className="text-slate-500 text-sm italic">
                  {category.description || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(category)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(category._id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              and may affect associated cameras and guardians.
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
export const CategoryTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between px-6 py-4">
      <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
    </div>
    <div className="divide-y divide-slate-100">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);