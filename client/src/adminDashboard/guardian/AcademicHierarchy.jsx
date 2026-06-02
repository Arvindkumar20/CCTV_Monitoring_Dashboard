import { BookOpen, Users } from "lucide-react";

/* ----------------------- Class/Section/Group Display ----------------------- */
export const AcademicHierarchy = ({ guardian }) => {
  const getClassDisplay = () => {
    if (guardian.className) return guardian.className;
    if (guardian.Class?.name) return guardian.Class.name;
    return guardian.Class || "N/A";
  };

  const getSectionDisplay = () => {
    if (guardian.sectionName) return guardian.sectionName;
    if (guardian.section?.name) return guardian.section.name;
    return guardian.section || null;
  };

  const getGroupDisplay = () => {
    if (guardian.groupName) return guardian.groupName;
    if (guardian.group?.name) return guardian.group.name;
    return guardian.group || null;
  };

  const className = getClassDisplay();
  const sectionName = getSectionDisplay();
  const groupName = getGroupDisplay();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs">
        <BookOpen className="w-3 h-3 text-slate-400" />
        <span className="font-medium text-slate-700">Class:</span>
        <span className="text-slate-600">{className}</span>
      </div>
      
      {sectionName && (
        <div className="flex items-center gap-1 text-xs">
          <Users className="w-3 h-3 text-slate-400" />
          <span className="font-medium text-slate-700">Section:</span>
          <span className="text-slate-600">{sectionName}</span>
        </div>
      )}
      
      {groupName && (
        <div className="flex items-center gap-1 text-xs">
          <Users className="w-3 h-3 text-slate-400" />
          <span className="font-medium text-slate-700">Group:</span>
          <span className="text-slate-600">{groupName}</span>
        </div>
      )}
    </div>
  );
};