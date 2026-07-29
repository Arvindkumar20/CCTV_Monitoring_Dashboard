import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import AddGuardian from "@/adminDashboard/guardian/AddGuardian";
import { CreateAccount } from "@/pages/CreateAccount";
import GuardianDetails from "@/adminDashboard/guardian/GuardianDetails";
import { Loader2 } from "lucide-react";

// Lazy imports
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const CategoryManagement = lazy(() => import("../pages/CategoryManagement"));
const SubCategoryManagement = lazy(
  () => import("../pages/SubCategoryManagement"),
);
const NestedCategoryManagement = lazy(
  () => import("../pages/NestedCategoryManagement"),
);
const CameraManagement = lazy(() => import("../pages/CameraManagement"));
const GuardianManagement = lazy(() => import("../pages/GuardianManagement"));
const ParentPortal = lazy(() => import("../pages/ParentPortal"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
// const CreateAccount = lazy(() => import("../pages/CreateAccount"));
const SystemSettings = lazy(() => import("../pages/SystemSettings"));
const ActivityLogs = lazy(() => import("../pages/ActivityLogs"));

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Loading, please wait...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/admin-login"
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          }
        />
        <Route path="/register" element={<CreateAccount />} />

        {/* ================= SCHOOL DASHBOARD ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/categories"
          element={
            <ProtectedRoute>
              <CategoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sub-categories"
          element={
            <ProtectedRoute>
              <SubCategoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sub-sub-categories"
          element={
            <ProtectedRoute>
              <NestedCategoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/cameras"
          element={
            <ProtectedRoute>
              <CameraManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/guardians"
          element={
            <ProtectedRoute>
              <GuardianManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/guardian/:id"
          element={
            <ProtectedRoute>
              <GuardianDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/guardians/add"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AddGuardian />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SystemSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/logs"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ActivityLogs />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= PARENT PORTAL ================= */}
        <Route
          path="/parent-portal"
          element={
            // <ProtectedRoute allowedType="parent">
            <ParentPortal />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
