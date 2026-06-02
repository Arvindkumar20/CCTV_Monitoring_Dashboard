// components/category/BackButton.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const BackButton = ({
  to = "/dashboard",
  toAction = "/dashboard",
  label = "Back to Dashboard",
  labelForAction = "Dashboard",
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={() => navigate(to)}
        className="flex items-center justify-between text-slate-500 hover:text-blue-600 transition-colors p-0 h-auto"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        <span className="font-medium">{label}</span>
      </Button>
      <Link
        to={toAction}
        className="flex items-center justify-between bg-blue-600 py-2 px-2 rounded-md  hover:bg-blue-700 cursor-pointer  text-slate-50 hover:text-gray-50 transition-colors p-0 h-auto"
      >
        <span className="font-medium"> Add {labelForAction}</span>
      </Link>
    </div>
  );
};
