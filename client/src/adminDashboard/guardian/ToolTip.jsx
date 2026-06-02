import { Button } from "@/components/ui/button";
import { TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users } from "lucide-react";
import { Tooltip } from "radix-ui";

/* ----------------------- Full Hierarchy Tooltip ----------------------- */
export const HierarchyTooltip = ({ guardian }) => {
  const hierarchy = guardian.fullHierarchy;
  
  if (!hierarchy || (!hierarchy.class && !hierarchy.section && !hierarchy.group)) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Users className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-900">Academic Hierarchy</p>
            
            {hierarchy.class && (
              <div className="text-xs">
                <span className="text-slate-500">Class:</span>
                <span className="ml-1 font-medium">{hierarchy.class.name}</span>
              </div>
            )}
            
            {hierarchy.section && (
              <div className="text-xs">
                <span className="text-slate-500">Section:</span>
                <span className="ml-1 font-medium">{hierarchy.section.name}</span>
                {hierarchy.section.class && (
                  <span className="ml-1 text-slate-400">
                    (under {hierarchy.section.class.name})
                  </span>
                )}
              </div>
            )}
            
            {hierarchy.group && (
              <div className="text-xs">
                <span className="text-slate-500">Group:</span>
                <span className="ml-1 font-medium">{hierarchy.group.name}</span>
                {hierarchy.group.level > 1 && (
                  <span className="ml-1 text-slate-400">(Level {hierarchy.group.level})</span>
                )}
                {hierarchy.group.color && (
                  <span 
                    className="ml-2 inline-block w-2 h-2 rounded-full" 
                    style={{ backgroundColor: hierarchy.group.color }}
                  />
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};