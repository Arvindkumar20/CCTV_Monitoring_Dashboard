// components/dashboard/Sidebar.jsx
import React from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FolderTree,
  Camera,
  Shield,
  CloudUpload,
  History,
  Settings,
  LogOut,
  Video,
  X,
} from "lucide-react";
import { showConfirmDialog } from "@/services/pop";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/", active: true },
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    active: true,
  },
  { icon: FolderTree, label: "Category Mgmt", href: "/dashboard/categories" },
  { icon: Camera, label: "Camera Mgmt", href: "/dashboard/cameras" },
  { icon: Shield, label: "Guardian Mgmt", href: "/dashboard/guardians" },
  
  { icon: History, label: "Activity Logs", href: "/dashboard/logs" },
];

const bottomNavItems = [
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];
// logout
export const Sidebar = ({ isMobile = false, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = async () => {
    const confirmed = await showConfirmDialog({
      title: "Are you sure to logout?",
      text: "You will be redirected to the landing page.",
      icon: "warning",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#f43f5e",
    });

    if (confirmed) {
      logout(); // your logout function from useAuth
      navigate("/"); // redirect to landing page
      console.log("Logged out successfully!");
    } else {
      console.log("Logout cancelled");
    }
  };

  return (
    <aside className="h-full bg-slate-900 text-white flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
          <Video className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">CCTV Panel</span>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-white hover:bg-slate-800"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-all",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
              onClick={isMobile ? onClose : undefined}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        <Separator className="my-4 bg-slate-800" />

        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800 hover:text-white p-3 rounded-lg transition-all"
            onClick={isMobile ? onClose : undefined}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center cursor-pointer space-x-3 text-red-400 hover:text-red-300 w-full p-2 transition-colors rounded-lg hover:bg-slate-800"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// Sidebar Skeleton
export const SidebarSkeleton = () => (
  <aside className="h-full bg-slate-900 text-white flex flex-col">
    <div className="p-6 flex items-center space-x-3">
      <div className="w-8 h-8 bg-slate-700 rounded animate-pulse" />
      <div className="h-6 w-24 bg-slate-700 rounded animate-pulse" />
    </div>
    <nav className="flex-1 px-4 space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
      ))}
    </nav>
  </aside>
);
