import React from "react";

import {
  FolderPlus,
  Video,
  UserPlus,
  Upload,
  Sliders,
  UserCheck,
  Users,
  Layers,
  TrendingUp,
} from "lucide-react";

import {
  QuickActionButton,
} from "@/adminDashboard/dashboard/QuickActionButton";
// import { StatCard } from "@/adminDashboard/dashboard/StatCard";
// import { StorageCard } from "@/adminDashboard/dashboard/StorageCard";
import { ActivityTable } from "@/adminDashboard/dashboard/ActivityTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import AdminLayout from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/adminDashboard/dashboard/StatCard";

const quickActions = [
  { icon: FolderPlus, label: "Create Category", color: "blue",to:"/dashboard/categories" },
  { icon: Video, label: "Add Camera", color: "emerald",to:"/dashboard/cameras" },
  { icon: UserPlus, label: "Add Guardian", color: "indigo",to:"/dashboard/guardians/add" },
  { icon: Upload, label: "Bulk Upload", color: "amber" ,to:"/dashboard/logs"},
  { icon: Sliders, label: "Settings", color: "slate",to:"/dashboard/settings" },
];

const iconMap = {
  UserCheck,
  Users,
  Layers,
  TrendingUp,
};

export default function AdminDashboard() {
  const { data } = useDashboardData();
  const navigate=useNavigate();

  return (
    <AdminLayout>

      {/* Quick Actions */}
      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              {...action}
              onClick={() => navigate(action.to)}
            />
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {data?.stats?.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
             
              icon={iconMap[stat.icon]}
            />
          ))}

          <StatCard
            title="Cameras Active"
            value={`${data?.cameras?.active} / ${data?.cameras?.total}`}
            subtitle="System Online"
            icon={Video}
            iconBg="bg-emerald-100"
          />

          <StatCard
            title="Daily Active Users"
            value={data?.activeUsers?.toString()}
            subtitle="Guardians currently viewing"
            icon={TrendingUp}
            iconBg="bg-indigo-100"
          />

          {/* <StorageCard {...data?.storage} /> */}
        </div>
      </section>

      {/* Activity Table */}
      <section>
        <ActivityTable
          activities={data?.activities}
          onViewAll={() => console.log("View all activities")}
        />
      </section>

    </AdminLayout>
  );
}
