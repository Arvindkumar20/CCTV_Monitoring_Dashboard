import { useState, useRef, useEffect } from "react";
import { Bell, Volume2, VolumeX, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAlerts } from "@/context/AlertContext";
// import { useAlerts } from "../../context/AlertContext";

const AlertBell = () => {
  const {
    unreadCount,
    alerts,
    connected,
    soundMuted,
    toggleSound,
    markAllRead,
  } = useAlerts();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Alerts"
      >
        <Bell size={22} className="text-gray-700" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Connection dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white ${
            connected ? "bg-green-500" : "bg-gray-400"
          }`}
          title={connected ? "Live" : "Offline"}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div>
              <h3 className="font-semibold text-gray-900">Alerts</h3>
              <p className="text-xs text-gray-500">
                {connected ? "🟢 Live" : "⚪ Offline"} • {unreadCount} unread
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className="p-1.5 hover:bg-gray-200 rounded transition"
                title={soundMuted ? "Unmute" : "Mute"}
              >
                {soundMuted ? (
                  <VolumeX size={16} className="text-gray-600" />
                ) : (
                  <Volume2 size={16} className="text-gray-600" />
                )}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 hover:bg-gray-200 rounded transition"
                  title="Mark all read"
                >
                  <CheckCheck size={16} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto">
            {recentAlerts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                No alerts yet
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <Link
                  key={alert._id || alert.id}
                  to={`/alerts/${alert._id || alert.id}`}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 border-b hover:bg-gray-50 transition ${
                    !alert.acknowledged ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">
                      {alert.type === "fire"
                        ? "🔥"
                        : alert.type === "smoke"
                        ? "💨"
                        : "🚨"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {alert.cameraName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <Link
            to="/alerts"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 border-t transition"
          >
            View all alerts →
          </Link>
        </div>
      )}
    </div>
  );
};

export default AlertBell;