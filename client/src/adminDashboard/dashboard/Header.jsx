// components/dashboard/Header.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Bell } from "lucide-react";

export const Header = ({
  schoolName,
  adminName,
  currentDate,
  onMenuClick,
  user,
  onNotificationClick,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-none">
              {schoolName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Surveillance Command Center
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-900">
              Welcome, {adminName}
            </p>
            <p className="text-xs text-slate-500">{currentDate}</p>
          </div>
          <div className="flex items-center space-x-2 border-l pl-6 border-slate-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onNotificationClick}>
                  New guardian registration
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onNotificationClick}>
                  Camera 12 offline
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onNotificationClick}>
                  System update completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Avatar className="border border-slate-200">
              <AvatarImage
                src={
                  user.userProfilePic ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminName}`
                }
              />
              <AvatarFallback>
                {adminName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

// Header Skeleton
export const HeaderSkeleton = () => (
  <header className="bg-white border-b border-slate-200">
    <div className="flex items-center justify-between px-4 md:px-8 py-4">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-slate-200 rounded md:hidden animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="hidden md:block space-y-2">
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse ml-auto" />
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
      </div>
    </div>
  </header>
);
