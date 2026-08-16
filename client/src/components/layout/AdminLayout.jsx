// import React, { useState, useEffect } from "react";
// import { Sheet, SheetContent } from "@/components/ui/sheet";
// import { Sidebar } from "@/adminDashboard/dashboard/Sidebar";
// import { Header } from "@/adminDashboard/dashboard/Header";
// import { useAuth } from "@/hooks/useAuth";
// import { useSettings } from "@/hooks/useSettings";

// export default function AdminLayout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentDate, setCurrentDate] = useState("");
//   const { user } = useAuth();
//   const {settings}=useSettings();
//   console.log(settings);
//   console.log(user);
//   useEffect(() => {
//     const today = new Date();
//     setCurrentDate(
//       today.toLocaleDateString("en-US", {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       }),
//     );
//   }, []);

//   return (
//     <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
//       {/* Desktop Sidebar */}
//       <div className="hidden md:flex md:w-64 md:flex-col h-screen border-r bg-slate-900">
//         <Sidebar />
//       </div>

//       {/* Mobile Sidebar */}
//       <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
//         <SheetContent
//           side="left"
//           className="p-0 w-72 bg-slate-900 border-r border-slate-800"
//         >
//           <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
//         </SheetContent>
//       </Sheet>

//       {/* Main Content Area */}
//       <div className="flex flex-col flex-1 h-screen">
//         {/* Header */}
//         <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
//           <Header
//             schoolName={settings?.schoolInfo.schoolName }
//             adminName={user.fullName}
//             currentDate={currentDate}
//             user={user}
//             onMenuClick={() => setSidebarOpen(true)}
//             onNotificationClick={() => console.log("Notification clicked")}
//           />
//         </div>

//         {/* Scrollable Content */}
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
//           <div className="max-w-[1600px] mx-auto space-y-10">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }




// layouts/AdminLayout.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "@/adminDashboard/dashboard/Sidebar";
import { Header } from "@/adminDashboard/dashboard/Header";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const { user } = useAuth();
  const { settings, loading } = useSettings();

  // Memoize settings data with defaults
  const displaySettings = useMemo(() => {
    if (!settings) {
      return {
        schoolInfo: {
          schoolName: "School Name",
          schoolAddress: "",
          schoolPhone: "",
          schoolEmail: "",
          schoolWebsite: "",
        },
        branding: {
          logo: "",
          favicon: "",
          primaryColor: "#2563eb",
          secondaryColor: "#5419bb",
          accentColor: "#06b6d4",
        },
        profile: {
          fullName: user?.fullName || user?.name || "",
          email: user?.email || "",
          phone: "",
          position: "",
          department: "",
          bio: "",
          avatar: user?.profilePic || "",
          joinDate: "",
        }
      };
    }

    return {
      schoolInfo: settings.schoolInfo || {
        schoolName: "School Name",
        schoolAddress: "",
        schoolPhone: "",
        schoolEmail: "",
        schoolWebsite: "",
      },
      branding: settings.branding || {
        logo: "",
        favicon: "",
        primaryColor: "#2563eb",
        secondaryColor: "#5419bb",
        accentColor: "#06b6d4",
      },
      profile: {
        ...settings.profile,
        fullName: settings.profile?.fullName || user?.fullName || user?.name || "",
        email: settings.profile?.email || user?.email || "",
        avatar: settings.profile?.avatar || user?.profilePic || "",
      },
    };
  }, [settings, user]);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col h-screen border-r bg-slate-900">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-slate-900 border-r border-slate-800"
        >
          <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-screen">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
          <Header
            schoolName={displaySettings.schoolInfo.schoolName}
            adminName={displaySettings.profile.fullName || user?.fullName || "Admin"}
            currentDate={currentDate}
            user={user}
            settings={displaySettings}
            loading={loading}
            onMenuClick={() => setSidebarOpen(true)}
            onNotificationClick={() => console.log("Notification clicked")}
          />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto space-y-10">{children}</div>
        </main>
      </div>
    </div>
  );
}