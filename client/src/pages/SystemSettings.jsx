// pages/SystemSettings.jsx
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

// Import components

// Import hooks
import { useSettings } from "@/hooks/useSettings";
import { SchoolInfoCard, SchoolInfoCardSkeleton } from "./settings/SchoolInfoCard";
import { SystemPreferencesCard, SystemPreferencesCardSkeleton } from "./settings/SystemPreferencesCard";
import { SecurityCard, SecurityCardSkeleton } from "./settings/SecurityCard";
import { SettingsHeader, SettingsHeaderSkeleton } from "./settings/SettingsHeader";
import { SettingsSidebar, SettingsSidebarSkeleton } from "./settings/SettingsSidebar";
import { SaveButton } from "./settings/SaveButton";

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

function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");
  const {
    settings,
    loading,
    isSaving,
    updateSchoolInfo,
    toggle3rdLevel,
    saveAllSettings,
    updatePassword,
  } = useSettings();

  const handleSaveAll = async () => {
    await saveAllSettings();
  };

  const handlePasswordUpdate = async (passwordData) => {
    await updatePassword(passwordData);
  };

  const renderContent = () => {
    if (!settings) return null;

    switch (activeTab) {
      case "general":
        return (
          <SchoolInfoCard
            data={settings.schoolInfo}
            onChange={updateSchoolInfo}
          />
        );
      case "system":
        return (
          <SystemPreferencesCard
            preferences={settings.preferences}
            storageData={settings.storage}
            onToggle3rdLevel={(enabled) => toggle3rdLevel(enabled)}
          />
        );
      case "security":
        return (
          <SecurityCard onSubmit={handlePasswordUpdate} />
        );
    //   case "storage":
    //     return (
    //       <SystemPreferencesCard
    //         preferences={settings.preferences}
    //         storageData={settings.storage}
    //         onToggle3rdLevel={(enabled) => toggle3rdLevel(enabled)}
    //       />
    //     );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        {loading ? (
          <SettingsHeaderSkeleton />
        ) : (
          <SettingsHeader
            title="System Settings"
            description="Configure global preferences and school identity"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          {loading ? (
            <SettingsSidebarSkeleton />
          ) : (
            <SettingsSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Dynamic Content */}
            {loading ? (
              <>
                <SchoolInfoCardSkeleton />
                <SystemPreferencesCardSkeleton />
                <SecurityCardSkeleton />
              </>
            ) : (
              renderContent()
            )}

            {/* Global Save Button */}
            {!loading && (
              <SaveButton
                onSave={handleSaveAll}
                isSaving={isSaving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component with Error Boundary
export default function SystemSettings() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <SettingsContent />
    </ErrorBoundary>
  );
}