// // pages/SystemSettings.jsx
// import React, { useState } from "react";
// import { ErrorBoundary } from "react-error-boundary";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { AlertCircle, RefreshCw } from "lucide-react";

// // Import components

// // Import hooks
// import { useSettings } from "@/hooks/useSettings";
// import { SchoolInfoCard, SchoolInfoCardSkeleton } from "./settings/SchoolInfoCard";
// import { SystemPreferencesCard, SystemPreferencesCardSkeleton } from "./settings/SystemPreferencesCard";
// import { SecurityCard, SecurityCardSkeleton } from "./settings/SecurityCard";
// import { SettingsHeader, SettingsHeaderSkeleton } from "./settings/SettingsHeader";
// import { SettingsSidebar, SettingsSidebarSkeleton } from "./settings/SettingsSidebar";
// import { SaveButton } from "./settings/SaveButton";

// // Error Fallback Component
// const ErrorFallback = ({ error, resetErrorBoundary }) => (
//   <div className="min-h-screen flex items-center justify-center p-4">
//     <Alert variant="destructive" className="max-w-lg">
//       <AlertCircle className="h-4 w-4" />
//       <AlertTitle>Something went wrong</AlertTitle>
//       <AlertDescription className="mt-2">{error.message}</AlertDescription>
//       <Button onClick={resetErrorBoundary} className="mt-4">
//         <RefreshCw className="w-4 h-4 mr-2" /> Try again
//       </Button>
//     </Alert>
//   </div>
// );

// function SettingsContent() {
//   const [activeTab, setActiveTab] = useState("general");
//   const {
//     settings,
//     loading,
//     isSaving,
//     updateSchoolInfo,
//     toggle3rdLevel,
//     saveAllSettings,
//     updatePassword,
//   } = useSettings();

//   const handleSaveAll = async () => {
//     await saveAllSettings();
//   };

//   const handlePasswordUpdate = async (passwordData) => {
//     await updatePassword(passwordData);
//   };

//   const renderContent = () => {
//     if (!settings) return null;

//     switch (activeTab) {
//       case "general":
//         return (
//           <SchoolInfoCard
//             data={settings.schoolInfo}
//             onChange={updateSchoolInfo}
//           />
//         );
//       case "system":
//         return (
//           <SystemPreferencesCard
//             preferences={settings.preferences}
//             storageData={settings.storage}
//             onToggle3rdLevel={(enabled) => toggle3rdLevel(enabled)}
//           />
//         );
//       case "security":
//         return (
//           <SecurityCard onSubmit={handlePasswordUpdate} />
//         );
//     //   case "storage":
//     //     return (
//     //       <SystemPreferencesCard
//     //         preferences={settings.preferences}
//     //         storageData={settings.storage}
//     //         onToggle3rdLevel={(enabled) => toggle3rdLevel(enabled)}
//     //       />
//     //     );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="bg-slate-50 min-h-screen p-4 md:p-8">
//       <div className="max-w-4xl mx-auto space-y-6">
//         {/* Header */}
//         {loading ? (
//           <SettingsHeaderSkeleton />
//         ) : (
//           <SettingsHeader
//             title="System Settings"
//             description="Configure global preferences and school identity"
//           />
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Sidebar Navigation */}
//           {loading ? (
//             <SettingsSidebarSkeleton />
//           ) : (
//             <SettingsSidebar
//               activeTab={activeTab}
//               onTabChange={setActiveTab}
//             />
//           )}

//           {/* Main Content Area */}
//           <div className="md:col-span-2 space-y-6">
//             {/* Dynamic Content */}
//             {loading ? (
//               <>
//                 <SchoolInfoCardSkeleton />
//                 <SystemPreferencesCardSkeleton />
//                 <SecurityCardSkeleton />
//               </>
//             ) : (
//               renderContent()
//             )}

//             {/* Global Save Button */}
//             {!loading && (
//               <SaveButton
//                 onSave={handleSaveAll}
//                 isSaving={isSaving}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Main Component with Error Boundary
// export default function SystemSettings() {
//   return (
//     <ErrorBoundary
//       FallbackComponent={ErrorFallback}
//       onReset={() => window.location.reload()}
//     >
//       <SettingsContent />
//     </ErrorBoundary>
//   );
// }


// // pages/SystemSettings.jsx
// import React, { useState, useEffect, useContext } from "react";
// import { ErrorBoundary } from "react-error-boundary";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
// import { AuthContext } from "@/context/AuthContext";
// import { useSettings } from "@/hooks/useSettings";

// // Import components
// import { SchoolInfoCard, SchoolInfoCardSkeleton } from "./settings/SchoolInfoCard";
// import { SystemPreferencesCard, SystemPreferencesCardSkeleton } from "./settings/SystemPreferencesCard";
// import { SecurityCard, SecurityCardSkeleton } from "./settings/SecurityCard";
// import { SettingsHeader, SettingsHeaderSkeleton } from "./settings/SettingsHeader";
// import { SettingsSidebar, SettingsSidebarSkeleton } from "./settings/SettingsSidebar";
// import { SaveButton } from "./settings/SaveButton";

// const ErrorFallback = ({ error, resetErrorBoundary }) => (
//   <div className="min-h-screen flex items-center justify-center p-4">
//     <Alert variant="destructive" className="max-w-lg">
//       <AlertCircle className="h-4 w-4" />
//       <AlertTitle>Something went wrong</AlertTitle>
//       <AlertDescription className="mt-2">{error.message}</AlertDescription>
//       <Button onClick={resetErrorBoundary} className="mt-4">
//         <RefreshCw className="w-4 h-4 mr-2" /> Try again
//       </Button>
//     </Alert>
//   </div>
// );

// function SettingsContent() {
//   const [activeTab, setActiveTab] = useState("general");
//   const { user, loading: authLoading } = useContext(AuthContext);
  
//   const {
//     settings,
//     loading: settingsLoading,
//     isSaving,
//     isSubmitting,
//     error,
//     updateSchoolInfo,
//     toggle3rdLevel,
//     saveAllSettings,
//     updatePassword,
//     createDefaultSettings,
//     loadSettings,
//   } = useSettings();

//   const isLoading = authLoading || settingsLoading;

//   // Show loading
//   if (isLoading) {
//     return (
//       <div className="bg-slate-50 min-h-screen p-4 md:p-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center py-12">
//             <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
//             <p className="text-slate-600">{authLoading ? "Authenticating..." : "Loading settings..."}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // No user
//   if (!user) {
//     return (
//       <div className="bg-slate-50 min-h-screen p-4 md:p-8">
//         <div className="max-w-4xl mx-auto">
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Authentication Required</AlertTitle>
//             <AlertDescription className="mt-2">
//               Please login to access settings.
//               <Button onClick={() => window.location.href = "/admin-login"} className="mt-4">
//                 Go to Login
//               </Button>
//             </AlertDescription>
//           </Alert>
//         </div>
//       </div>
//     );
//   }

//   // Error with retry and create options
//   if (error && !settings) {
//     return (
//       <div className="bg-slate-50 min-h-screen p-4 md:p-8">
//         <div className="max-w-4xl mx-auto">
//           <Alert variant={error.includes("No settings") ? "default" : "destructive"}>
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>{error.includes("No settings") ? "No Settings Found" : "Error"}</AlertTitle>
//             <AlertDescription className="mt-2">
//               {error}
//               <div className="flex gap-2 mt-4 flex-wrap">
//                 <Button onClick={loadSettings} variant="outline">
//                   <RefreshCw className="w-4 h-4 mr-2" /> Retry
//                 </Button>
//                 {error.includes("No settings") && (
//                   <Button onClick={createDefaultSettings} disabled={isSubmitting}>
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Creating...
//                       </>
//                     ) : (
//                       "Create Default Settings"
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </AlertDescription>
//           </Alert>
//         </div>
//       </div>
//     );
//   }

//   // No settings - show create form
//   if (!settings || !settings.schoolInfo) {
//     return (
//       <div className="bg-slate-50 min-h-screen p-4 md:p-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <div className="text-center py-8">
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 No Settings Found
//               </h3>
//               <p className="text-gray-600 mb-4">
//                 Click the button below to create default settings and start configuring your system.
//               </p>
//               <Button
//                 onClick={createDefaultSettings}
//                 disabled={isSubmitting}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   "Create Default Settings"
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render settings
//   const renderContent = () => {
//     switch (activeTab) {
//       case "general":
//         return <SchoolInfoCard data={settings.schoolInfo} onChange={updateSchoolInfo} />;
//       case "system":
//         return (
//           <SystemPreferencesCard
//             preferences={settings.preferences}
//             storageData={settings.storage}
//             onToggle3rdLevel={toggle3rdLevel}
//           />
//         );
//       case "security":
//         return <SecurityCard onSubmit={updatePassword} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="bg-slate-50 min-h-screen p-4 md:p-8">
//       <div className="max-w-4xl mx-auto space-y-6">
//         <SettingsHeader
//           title="System Settings"
//           description="Configure global preferences and school identity"
//         />

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

//           <div className="md:col-span-2 space-y-6">
//             {renderContent()}
//             <SaveButton onSave={saveAllSettings} isSaving={isSaving} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function SystemSettings() {
//   return (
//     // <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
//       <SettingsContent />
//     // </ErrorBoundary>
//   );
// }


// pages/SystemSettings.jsx
import React, { useState, useEffect, useContext } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Loader2, Database, CheckCircle } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { useSettings } from "@/hooks/useSettings";

// Import components
import { SchoolInfoCard } from "./settings/SchoolInfoCard";
import { SystemPreferencesCard } from "./settings/SystemPreferencesCard";
import { SecurityCard } from "./settings/SecurityCard";
import { SettingsHeader } from "./settings/SettingsHeader";
import { SettingsSidebar } from "./settings/SettingsSidebar";
import { BrandingCard } from "./settings/BrandingCard";
import { ProfileCard } from "./settings/ProfileCard";
import { SaveButton } from "./settings/SaveButton";

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
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const {
    settings,
    loading: settingsLoading,
    isSaving,
    isSubmitting,
    error,
    useLocalStorage,
    updateSchoolInfo,
    toggle3rdLevel,
    saveAllSettings,
    updatePassword,
    createDefaultSettings,
    loadSettings,
    updateBranding,
    updateProfile,
  } = useSettings();

  const isLoading = authLoading || settingsLoading;

  // Show loading
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">{authLoading ? "Authenticating..." : "Loading settings..."}</p>
          </div>
        </div>
      </div>
    );
  }

  // No user but has local data
  if (!user && settings) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <Database className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Offline Mode</AlertTitle>
            <AlertDescription className="text-yellow-700">
              You're viewing settings from local storage. 
              <Button 
                onClick={() => window.location.href = "/admin-login"} 
                variant="outline" 
                className="mt-2 ml-2"
              >
                Login to sync
              </Button>
            </AlertDescription>
          </Alert>
          {renderSettings()}
        </div>
      </div>
    );
  }

  // No user and no data
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription className="mt-2">
              Please login to access settings.
              <Button onClick={() => window.location.href = "/admin-login"} className="mt-4">
                Go to Login
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Error with retry and create options
  if (error && !settings) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert variant={error.includes("No settings") ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error.includes("No settings") ? "No Settings Found" : "Error"}</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
              <div className="flex gap-2 mt-4 flex-wrap">
                <Button onClick={loadSettings} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </Button>
                {error.includes("No settings") && (
                  <Button onClick={createDefaultSettings} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Default Settings"
                    )}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // No settings - show create form
  if (!settings || !settings.schoolInfo) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Settings Found
              </h3>
              <p className="text-gray-600 mb-4">
                Click the button below to create default settings and start configuring your system.
              </p>
              <Button
                onClick={createDefaultSettings}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Default Settings"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render settings
  const renderSettings = () => {
    const renderContent = () => {
      switch (activeTab) {
        case "general":
          return (
            <div className="space-y-6">
              <SchoolInfoCard 
                data={settings.schoolInfo} 
                onChange={updateSchoolInfo} 
              />
              <BrandingCard 
                data={settings.branding || {}} 
                onChange={updateBranding} 
              />
            </div>
          );
        case "profile":
          return (
            <ProfileCard 
              data={settings.profile || {}} 
              onChange={updateProfile}
              user={user}
            />
          );
        case "system":
          return (
            <SystemPreferencesCard
              preferences={settings.preferences}
              storageData={settings.storage}
              onToggle3rdLevel={toggle3rdLevel}
            />
          );
        case "security":
          return <SecurityCard onSubmit={updatePassword} />;
        default:
          return null;
      }
    };

    return (
      <div className="space-y-6">
        <SettingsHeader
          title="System Settings"
          description="Configure global preferences and  identity"
        />

        {useLocalStorage && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Database className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Local Storage Mode</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Settings are stored locally. Connect to server to sync data.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            {renderContent()}
            {activeTab !== 'profile' && activeTab !== 'security' && (
              <SaveButton onSave={saveAllSettings} isSaving={isSaving} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {renderSettings()}
      </div>
    </div>
  );
}

export default function SystemSettings() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <SettingsContent />
    </ErrorBoundary>
  );
}