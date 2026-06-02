import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Wifi, WifiOff, Eye } from "lucide-react";

export const ChildCard = ({ child, onClick }) => {
  const statusConfig = {
    online: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      icon: Wifi,
      label: "Live"
    },
    offline: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      icon: WifiOff,
      label: "Offline"
    }
  };

  const status = child.hasCamera ? 'online' : 'offline';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onClick(child)}>
      <CardContent className="p-0">
        {/* Preview Thumbnail */}
        <div className="aspect-video bg-slate-100 relative overflow-hidden rounded-t-lg">
          {child.hasCamera ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="absolute top-2 right-2">
                <Badge className={`${config.bg} ${config.text} border-0`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-slate-800 mb-1">{child.name}</h3>
          <p className="text-sm text-slate-500 mb-3">{child.class} • {child.section}</p>
          
          <Button 
            className="w-full"
            variant={child.hasCamera ? "default" : "outline"}
            disabled={!child.hasCamera}
          >
            <Eye className="w-4 h-4 mr-2" />
            {child.hasCamera ? "View Live Feed" : "No Camera"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ChildCardSkeleton = () => (
  <Card>
    <CardContent className="p-0">
      <div className="aspect-video bg-slate-200 rounded-t-lg animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);