// components/nested-subcategory/NestedCategoryTable.jsx
import React, { useState, useMemo } from "react";
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
import {
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  FolderPlus,
  Layers,
  FolderTree,
  Hash,
  Calendar,
  Eye,
  EyeOff,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export const NestedCategoryTable = ({
  categories = [],
  mainCategories = [],
  subCategories = [],
  onEdit,
  onDelete,
  onAddSubCategory,
  onToggleStatus,
  isLoading = false,
}) => {
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [deleteItemName, setDeleteItemName] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [mobileView, setMobileView] = useState(false);

  // Check if mobile view on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDeleteClick = (item) => {
    setDeleteId(item._id || item.id);
    setDeleteItemName(item.name);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
      setDeleteItemName("");
    }
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(categories.map(cat => cat._id || cat.id));
    setExpandedRows(allIds);
  };

  const collapseAll = () => {
    setExpandedRows(new Set());
  };

  const buildTree = useMemo(() => {
    return (parentId = null) => {
      if (parentId === null) {
        return categories
          .filter((cat) => !cat.parentNestedId)
          .sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return (a.name || "").localeCompare(b.name || "");
          });
      }
      
      return categories
        .filter((cat) => {
          const catParentId = cat.parentNestedId?._id || cat.parentNestedId;
          return catParentId && String(catParentId) === String(parentId);
        })
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return (a.name || "").localeCompare(b.name || "");
        });
    };
  }, [categories]);

  const getMainCategoryName = (mainCategoryId) => {
    if (!mainCategoryId) return "Unknown";
    const mainCat = mainCategories.find(c => 
      String(c._id || c.id) === String(mainCategoryId)
    );
    return mainCat?.name || "Unknown";
  };

  const getSubCategoryName = (subCategoryId) => {
    if (!subCategoryId) return "Unknown";
    const subCat = subCategories.find(s => 
      String(s._id || s.id) === String(subCategoryId)
    );
    return subCat?.name || "Unknown";
  };

  const getParentPath = (category) => {
    const path = [];
    
    if (category.mainCategoryId) {
      const mainCatId = category.mainCategoryId._id || category.mainCategoryId;
      path.push({
        type: 'main',
        id: mainCatId,
        name: getMainCategoryName(mainCatId),
        color: '#3b82f6',
        icon: '🏢'
      });
    }

    if (category.subCategoryId) {
      const subCatId = category.subCategoryId._id || category.subCategoryId;
      path.push({
        type: 'sub',
        id: subCatId,
        name: getSubCategoryName(subCatId),
        color: '#8b5cf6',
        icon: '📂'
      });
    }

    const buildNestedPath = (item) => {
      if (item.parentNestedId) {
        const parentId = item.parentNestedId._id || item.parentNestedId;
        const parent = categories.find(c => 
          String(c._id || c.id) === String(parentId)
        );
        if (parent) {
          buildNestedPath(parent);
          path.push({
            type: 'nested',
            id: parent._id || parent.id,
            name: parent.name,
            color: parent.color || '#10b981',
            icon: '📁'
          });
        }
      }
    };

    buildNestedPath(category);
    
    path.push({
      type: 'current',
      id: category._id || category.id,
      name: category.name,
      color: category.color || '#f59e0b',
      icon: '📍'
    });

    return path;
  };

  const getHierarchyLevel = (category) => {
    let level = 0;
    let current = category;
    while (current.parentNestedId) {
      level++;
      const parentId = current.parentNestedId._id || current.parentNestedId;
      current = categories.find(c => 
        String(c._id || c.id) === String(parentId)
      ) || {};
    }
    return level;
  };

  const getGradientColor = (category) => {
    const level = getHierarchyLevel(category);
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-emerald-500 to-emerald-600',
      'from-amber-500 to-amber-600',
      'from-rose-500 to-rose-600',
      'from-indigo-500 to-indigo-600',
    ];
    return colors[level % colors.length];
  };

  const renderMobileCard = (category, level = 0) => {
    const categoryId = category._id || category.id;
    const children = buildTree(categoryId);
    const hasChildren = children.length > 0;
    const isExpanded = expandedRows.has(categoryId);
    const path = getParentPath(category);
    const gradientClass = getGradientColor(category);

    return (
      <motion.div
        key={categoryId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="mb-3"
      >
        <Card className={`overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 ${
          hoveredRow === categoryId ? 'ring-2 ring-blue-200' : ''
        }`}>
          {/* Header with gradient */}
          <div 
            className={`bg-gradient-to-r ${gradientClass} p-4 cursor-pointer`}
            onClick={() => hasChildren && toggleExpand(categoryId)}
            onMouseEnter={() => setHoveredRow(categoryId)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FolderTree className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white truncate">
                      {category.name}
                    </h3>
                    {!category.isActive && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
              
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 w-8 h-8"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 bg-white">
            <div className="space-y-3">
              {/* Path */}
              <div className="flex items-center flex-wrap gap-1.5">
                {path.map((item, index) => (
                  <React.Fragment key={`${item.type}-${item.id}-${index}`}>
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0.5 px-2 font-medium rounded-full"
                      style={{
                        backgroundColor: `${item.color}10`,
                        borderColor: `${item.color}30`,
                        color: item.color,
                      }}
                    >
                      <span className="mr-1">{item.icon}</span>
                      <span className="max-w-[80px] truncate">{item.name}</span>
                    </Badge>
                    {index < path.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-xs text-slate-500 block">Level</span>
                  <span className="font-medium text-slate-700">{category.level || 1}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-xs text-slate-500 block">Order</span>
                  <span className="font-medium text-slate-700">{category.order || 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddSubCategory(category)}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <FolderPlus className="w-4 h-4 mr-1" />
                  Add Child
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(category)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(category)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Children */}
          <AnimatePresence>
            {isExpanded && children.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-50 px-4 py-2 space-y-2"
              >
                {children.map((child) => renderMobileCard(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };

  const renderDesktopRow = (category, level = 0) => {
    const categoryId = category._id || category.id;
    const children = buildTree(categoryId);
    const hasChildren = children.length > 0;
    const isExpanded = expandedRows.has(categoryId);
    const path = getParentPath(category);
    const mainCategoryId = category.mainCategoryId?._id || category.mainCategoryId;
    const subCategoryId = category.subCategoryId?._id || category.subCategoryId;
    const isHovered = hoveredRow === categoryId;

    return (
      <React.Fragment key={categoryId}>
        <motion.tr
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`group transition-all duration-200 ${
            isHovered ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 shadow-sm' : ''
          }`}
          onMouseEnter={() => setHoveredRow(categoryId)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          <TableCell className="py-4">
            <div className="flex items-start space-x-2">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-6 h-6 mt-1 flex-shrink-0 transition-all duration-200 ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                  onClick={() => toggleExpand(categoryId)}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              ) : (
                <div className="w-6 h-6 mt-1 flex-shrink-0" />
              )}
              
              <div className="flex items-start flex-shrink-0">
                {Array.from({ length: level }).map((_, i) => (
                  <span key={i} className="w-4 text-slate-300 select-none text-xs">└</span>
                ))}
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-2 ml-1 flex-shrink-0 transition-all duration-200 ${
                    isHovered ? 'scale-125' : ''
                  }`}
                  style={{ backgroundColor: category.color || "#3b82f6" }}
                />
              </div>
              
              <div className="ml-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold transition-colors duration-200 ${
                    isHovered ? 'text-blue-600' : 'text-slate-700'
                  }`}>
                    {category.name}
                  </span>
                  {!category.isActive ? (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] px-1.5">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5">
                      <Eye className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                {category.description && (
                  <p className="text-xs text-slate-500 mt-0.5 font-normal italic line-clamp-2 max-w-md">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </TableCell>
          
          <TableCell className="py-4">
            <div className="flex flex-col gap-1 max-w-xs">
              <div className="flex items-center flex-wrap gap-1">
                {path.map((item, index) => (
                  <React.Fragment key={`${item.type}-${item.id}-${index}`}>
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0.5 px-1.5 font-normal whitespace-nowrap transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: `${item.color}10`,
                        borderColor: `${item.color}30`,
                        color: item.color,
                      }}
                    >
                      <span className="mr-1">{item.icon}</span>
                      {item.name}
                    </Badge>
                    {index < path.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </TableCell>
          
          <TableCell className="py-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px]">
                  <Hash className="w-3 h-3 mr-1" />
                  Level {category.level || 1}
                </Badge>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px]">
                  <Calendar className="w-3 h-3 mr-1" />
                  Order {category.order || 0}
                </Badge>
              </div>
              {mainCategoryId && (
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]" title={getMainCategoryName(mainCategoryId)}>
                  <span className="font-medium">Main:</span> {getMainCategoryName(mainCategoryId)}
                </span>
              )}
              {subCategoryId && (
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]" title={getSubCategoryName(subCategoryId)}>
                  <span className="font-medium">Sub:</span> {getSubCategoryName(subCategoryId)}
                </span>
              )}
            </div>
          </TableCell>
          
          <TableCell className="py-4 text-right">
            <div className="flex items-center justify-end space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddSubCategory(category)}
                className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                title="Add Nested Sub Category"
              >
                <FolderPlus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(category)}
                className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(category)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </TableCell>
        </motion.tr>
        
        <AnimatePresence>
          {isExpanded && children.length > 0 && (
            <motion.tr
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TableCell colSpan={4} className="p-0">
                <div className="bg-gradient-to-r from-slate-50/50 to-white">
                  <Table>
                    <TableBody>
                      {children.map((child) => renderDesktopRow(child, level + 1))}
                    </TableBody>
                  </Table>
                </div>
              </TableCell>
            </motion.tr>
          )}
        </AnimatePresence>
      </React.Fragment>
    );
  };

  const rootCategories = buildTree(null);

  if (isLoading) {
    return <NestedCategoryTableSkeleton />;
  }

  if (categories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-16 text-center bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200"
      >
        <div className="text-slate-300 mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <Layers className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          No Nested Categories Yet
        </h3>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          Start building your category hierarchy by creating your first nested sub category.
        </p>
        <Button 
          onClick={() => onAddSubCategory(null)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          Create First Category
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Total: {categories.length}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Root: {rootCategories.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="text-slate-600 hover:text-blue-600"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="text-slate-600 hover:text-blue-600"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Table/Cards View */}
      {mobileView ? (
        <div className="space-y-3">
          {rootCategories.length > 0 ? (
            rootCategories.map((category) => renderMobileCard(category))
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <FolderTree className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No root level categories found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-white">
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 w-2/5 py-4">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4" />
                    Nested Sub Category
                  </div>
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 w-2/5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Hierarchy Path
                  </div>
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 w-1/5">
                  Details
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 text-right w-24">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rootCategories.length > 0 ? (
                rootCategories.map((category) => renderDesktopRow(category))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                    <FolderTree className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    No root level nested sub categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Nested Sub Category
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {deleteItemName && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="font-medium text-red-700">
                    You are about to delete "{deleteItemName}"
                  </p>
                </div>
              )}
              <p className="text-slate-600">
                This action cannot be undone. This will permanently delete the nested sub category
                and ALL its child nested sub categories.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    This may affect associated cameras and other data linked to this category.
                  </span>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-slate-200 hover:bg-slate-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 border-0"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

// Enhanced Table Skeleton
export const NestedCategoryTableSkeleton = () => (
  <div className="space-y-4">
    {/* Toolbar Skeleton */}
    <div className="bg-white p-4 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>

    {/* Table Skeleton */}
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 animate-pulse">
            <div className="flex items-start space-x-2 flex-1">
              <div className="w-6 h-6 bg-slate-200 rounded mt-1" />
              <div className="w-4 h-4 bg-slate-200 rounded mt-2" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-64 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="w-64 h-8 bg-slate-200 rounded" />
            <div className="w-32 h-8 bg-slate-200 rounded" />
            <div className="flex space-x-2 ml-auto">
              <div className="w-8 h-8 bg-slate-200 rounded" />
              <div className="w-8 h-8 bg-slate-200 rounded" />
              <div className="w-8 h-8 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);