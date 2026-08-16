// import React from "react";
// import { NoCameraFeed } from "./NoCameraFeed";
// import { ParentHeader } from "../ParentHeader";
// import { LiveFeedVideo } from "./LiveFeedVideo";
// import { LiveFeedSecurity } from "./LiveFeedSecurity";

// export const LiveFeedScreen = ({ child, onBack, onLogout }) => {
//   // If no camera assigned
//   if (!child?.hasCamera) {
//     return <NoCameraFeed childName={child?.name} onBack={onBack} />;
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col">
//       <ParentHeader
//         title="Live Feed"
//         subtitle={
//           <>
//             <span>{child.class}</span>
//             <span className="w-1 h-1 bg-slate-300 rounded-full mx-2"></span>
//             <span>{child.name}</span>
//           </>
//         }
//         showBack
//         onBack={onBack}
//         onLogout={onLogout}
//       />

//       <main className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
//         <LiveFeedVideo child={child} />
//         <LiveFeedSecurity />
//       </main>
//     </div>
//   );
// };

// // Live Feed Skeleton
// export const LiveFeedScreenSkeleton = () => (
//   <div className="min-h-screen bg-slate-50">
//     <ParentHeaderSkeleton />
//     <main className="p-6">
//       <div className="aspect-video bg-slate-200 rounded-xl animate-pulse" />
//     </main>
//   </div>
// );

// LiveFeedScreen.jsx
import React, { useState } from "react";
import { NoCameraFeed } from "./NoCameraFeed";
import { ParentHeader } from "../ParentHeader";
import { LiveFeedVideo } from "./LiveFeedVideo";
import { LiveFeedSecurity } from "./LiveFeedSecurity";

import { Button } from "@/components/ui/button";
import { Video, Grid } from "lucide-react";
import RecordingDashboard from "@/pages/RecordingDashboard";

export const LiveFeedScreen = ({ child, onBack, onLogout }) => {
  const [showDashboard, setShowDashboard] = useState(false);

  // If no camera assigned
  if (!child?.hasCamera) {
    return <NoCameraFeed childName={child?.name} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ParentHeader
        title={showDashboard ? "Recording Center" : "Live Feed"}
        subtitle={
          showDashboard ? (
            <span className="text-sm text-slate-500">Manage all recordings</span>
          ) : (
            <>
              <span>{child.class}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full mx-2"></span>
              <span>{child.name}</span>
            </>
          )
        }
        showBack
        onBack={showDashboard ? () => setShowDashboard(false) : onBack}
        onLogout={onLogout}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDashboard(!showDashboard)}
            className="flex items-center gap-2"
          >
            {showDashboard ? (
              <>
                <Video className="w-4 h-4" />
                Live Feed
              </>
            ) : (
              <>
                <Grid className="w-4 h-4" />
                All Recordings
              </>
            )}
          </Button>
        }
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {!showDashboard ? (
          <RecordingDashboard child={child} />
        ) : (
          <div className="flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
            <LiveFeedVideo child={child} />
            <LiveFeedSecurity />
          </div>
        )}
      </main>
    </div>
  );
};

// Live Feed Skeleton
export const LiveFeedScreenSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <ParentHeaderSkeleton />
    <main className="p-6">
      <div className="aspect-video bg-slate-200 rounded-xl animate-pulse" />
    </main>
  </div>
);