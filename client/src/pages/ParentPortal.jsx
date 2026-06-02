// pages/ParentPortal.jsx
import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

// Import components


// Import hooks
import { useParentPortal } from "@/hooks/useParentPortal";
import { ParentLogin, ParentLoginSkeleton } from "./parent-portal/ParentLogin";
import { ParentHeader } from "./parent-portal/ParentHeader";
import { LiveFeedScreen, LiveFeedScreenSkeleton } from "./parent-portal/LiveFeed/LiveFeedScreen";
import { ChildrenGrid, ChildrenGridSkeleton } from "./parent-portal/ChildrenGrid";

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Alert variant="destructive" className="max-w-lg">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="mt-2">{error.message}</AlertDescription>
      <Button onClick={resetErrorBoundary} className="mt-4">
        <RefreshCw className="w-4 h-4 mr-2" /> Try again
      </Button>
    </Alert>
  </div>
);

// Auto-logout timer (5 minutes)
const AUTO_LOGOUT_TIME = 5 * 60 * 1000;

function ParentPortalContent() {
  const [view, setView] = useState("login"); // login, dashboard, live-feed
  const [selectedChild, setSelectedChild] = useState(null);
  const { user, loading, isAuthenticated, login, logout, getChildById } = useParentPortal();

  // Auto-logout timer
  useEffect(() => {
    let timeout;
    
    if (isAuthenticated) {
      const resetTimer = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          handleLogout();
        }, AUTO_LOGOUT_TIME);
      };

      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("click", resetTimer);
      window.addEventListener("keypress", resetTimer);

      resetTimer();

      return () => {
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("click", resetTimer);
        window.removeEventListener("keypress", resetTimer);
        clearTimeout(timeout);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = async (credentials) => {
    const success = await login(credentials);
    if (success) {
      setView("dashboard");
    }
  };

  const handleLogout = () => {
    logout();
    setView("login");
    setSelectedChild(null);
  };

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    setView("live-feed");
  };

  const handleBackToDashboard = () => {
    setSelectedChild(null);
    setView("dashboard");
  };

  // Render based on view
  const renderView = () => {
    if (loading) {
      switch (view) {
        case "login":
          return <ParentLoginSkeleton />;
        case "dashboard":
          return (
            <div className="min-h-screen bg-slate-50">
              <ParentHeader
                title="My Children"
                subtitle="Select a child to view live feed"
                onLogout={handleLogout}
              />
              <ChildrenGridSkeleton />
            </div>
          );
        case "live-feed":
          return <LiveFeedScreenSkeleton />;
        default:
          return null;
      }
    }

    switch (view) {
      case "login":
        return <ParentLogin onLogin={handleLogin} setView={setView}/>;
      case "dashboard":
        return (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <ParentHeader
              title="My Children"
              subtitle="Select a child to view live feed"
              onLogout={handleLogout}
            />
            <ChildrenGrid
              children={user?.children || []}
              onSelectChild={handleSelectChild}
            />
          </div>
        );
      case "live-feed":
        return (
          <LiveFeedScreen
            child={selectedChild}
            onBack={handleBackToDashboard}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  return renderView();
}

// Main Component with Error Boundary
export default function ParentPortal() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <ParentPortalContent />
    </ErrorBoundary>
  );
}