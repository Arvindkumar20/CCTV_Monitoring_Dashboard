import { X, Eye, AlertTriangle } from "lucide-react";

const typeConfig = {
  person: {
    emoji: "🚨",
    label: "HUMAN DETECTED",
    bg: "bg-amber-500",
    border: "border-amber-600",
    text: "text-amber-900",
  },
  fire: {
    emoji: "🔥",
    label: "FIRE DETECTED",
    bg: "bg-red-600",
    border: "border-red-700",
    text: "text-red-900",
  },
  smoke: {
    emoji: "💨",
    label: "SMOKE DETECTED",
    bg: "bg-gray-600",
    border: "border-gray-700",
    text: "text-gray-900",
  },
};

const AlertToast = ({ alert, onClose, onView }) => {
  const config = typeConfig[alert.type] || typeConfig.person;

  const timeStr = new Date(alert.timestamp).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className={`
        ${config.bg} text-white
        rounded-xl shadow-2xl
        w-[380px] max-w-full
        overflow-hidden
        animate-slide-in
        pointer-events-auto
      `}
      role="alert"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <span className="font-bold text-sm tracking-wide">{config.label}</span>
        </div>

        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-1.5">
        <p className="font-semibold text-base truncate">{alert.cameraName}</p>

        <div className="text-xs opacity-90 flex items-center gap-3 flex-wrap">
          <span>🕒 {timeStr}</span>
          <span>🎯 {(alert.confidence * 100).toFixed(0)}%</span>
        </div>

        {alert.snapshotPath && (
          <img
            src={alert.snapshotPath}
            alt="Snapshot"
            className="mt-2 w-full h-32 object-cover rounded-md border border-white/30"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex border-t border-white/20">
        <button
          onClick={onClose}
          className="flex-1 py-2 text-xs font-medium hover:bg-white/10 transition"
        >
          Dismiss
        </button>
        {onView && (
          <button
            onClick={onView}
            className="flex-1 py-2 text-xs font-medium hover:bg-white/10 transition border-l border-white/20 flex items-center justify-center gap-1"
          >
            <Eye size={12} />
            View
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertToast;