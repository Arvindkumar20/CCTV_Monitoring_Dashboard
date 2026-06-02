// components/category/CategoryHeader.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const CategoryHeader = ({ title, description, totalCount }) => {
  return (
    <CardHeader className="p-6 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">
            {title}
          </CardTitle>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {totalCount !== undefined && (
          <Badge variant="secondary" className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
            Total: {totalCount}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
};