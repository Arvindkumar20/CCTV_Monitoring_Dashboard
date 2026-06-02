import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VideoOff, ArrowLeft } from "lucide-react";

export const NoCameraFeed = ({ childName, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <VideoOff className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            No Camera Assigned
          </h2>
          <p className="text-slate-500 mb-6">
            {childName} doesn't have any camera assigned yet. Please contact the school administration.
          </p>
          <Button onClick={onBack}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};