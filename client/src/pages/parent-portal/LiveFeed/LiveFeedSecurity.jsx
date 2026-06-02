// components/parent-portal/LiveFeed/LiveFeedSecurity.jsx
import React from "react";
import { ShieldAlert } from "lucide-react";

export const LiveFeedSecurity = () => {
  const sessionId = React.useMemo(() => 
    Math.random().toString(36).substr(2, 9).toUpperCase(), 
    []
  );

  return (
    <div className="mt-4 w-full flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-lg">
      <div className="flex items-center gap-3">
        <ShieldAlert className="text-blue-600 w-5 h-5" />
        <span className="text-sm text-blue-800 font-medium">
          Screen recording is disabled for privacy.
        </span>
      </div>
      <span className="text-xs text-blue-400 hidden sm:block">
        Session ID: {sessionId}
      </span>
    </div>
  );
};