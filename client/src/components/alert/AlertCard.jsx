import { useState } from "react";
import {
  Check,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Camera,
  Target,
} from "lucide-react";

const typeStyles = {
  person: { bg: "bg-amber-100", text: "text-amber-700", emoji: "🚨" },
  fire: { bg: "bg-red-100", text: "text-red-700", emoji: "🔥" },
  smoke: { bg: "bg-gray-100", text: "text-gray-700", emoji: "💨" },
};

const statusStyles = {
  success: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-gray-100 text-gray-700",
  skipped: "bg-blue-100 text-blue-700",
};

const AlertCard = ({ alert, onAcknowledge, onRetry, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const type = typeStyles[alert.type] || typeStyles.person;
  const status = statusStyles[alert.overallStatus] || statusStyles.pending;

  const timeStr = new Date(alert.timestamp).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const getSnapshotUrl = (snapshotPath) => {
    if (!snapshotPath) return "";
    const normalizedPath = String(snapshotPath)
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");
    const encodedPath = normalizedPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
      console.log(`${import.meta.env.VITE_APP_API_URL}/detector-ai/${encodedPath}`)
    return `${import.meta.env.VITE_APP_API_URL}/detector-ai/${encodedPath}`;
  };

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition ${
        !alert.acknowledged ? "border-l-4 border-l-blue-500" : "border-gray-200"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${type.bg}`}>
            <span className="text-2xl">{type.emoji}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">
                {alert.cameraName}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${status}`}
              >
                {alert.overallStatus}
              </span>
              {!alert.acknowledged && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  NEW
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeStr}
              </span>
              <span className="flex items-center gap-1">
                <Camera size={12} />
                {alert.cameraId}
              </span>
              <span className="flex items-center gap-1">
                <Target size={12} />
                {(alert.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {!alert.acknowledged && (
              <button
                onClick={onAcknowledge}
                className="p-2 hover:bg-green-50 rounded-lg transition text-green-600"
                title="Acknowledge"
              >
                <Check size={16} />
              </button>
            )}

            {alert.overallStatus === "failed" && (
              <button
                onClick={onRetry}
                className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                title="Retry"
              >
                <RefreshCw size={16} />
              </button>
            )}

            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-4">
            {/* Snapshot */}
            {alert.snapshotPath && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Snapshot
                </p>

                <img
                  src={getSnapshotUrl(alert.snapshotPath)}
                  alt="Alert snapshot"
                  className="w-full rounded-lg border"
                  onError={(e) => {
                    console.log("Image URL failed:", e.currentTarget.src);
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Channel Status */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                Channel Status
              </p>
              <div className="space-y-2">
                {["email", "sms", "whatsapp", "call"].map((ch) => {
                  const channel = alert.channels?.[ch] || {};
                  const chStatus = channel.status || "skipped";
                  const color =
                    chStatus === "sent"
                      ? "text-green-600"
                      : chStatus === "failed"
                        ? "text-red-600"
                        : "text-gray-400";

                  return (
                    <div
                      key={ch}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize text-gray-700">{ch}</span>
                      <span className={`font-medium ${color}`}>
                        {chStatus === "sent" && "✅ Sent"}
                        {chStatus === "failed" && "❌ Failed"}
                        {chStatus === "skipped" && "⏭️ Skipped"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
