import { Badge } from "lucide-react";

/* ----------------------- Status Badge ----------------------- */
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      label: "Active",
      dot: "bg-emerald-500",
    },
    inactive: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      label: "Inactive",
      dot: "bg-slate-400",
    },
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      label: "Pending",
      dot: "bg-amber-500",
    },
    locked: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      label: "Locked",
      dot: "bg-rose-500",
    },
    suspended: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      label: "Suspended",
      dot: "bg-red-500",
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap flex items-center gap-1`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
};