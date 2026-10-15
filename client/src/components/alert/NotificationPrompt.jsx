import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useAlerts } from "@/context/AlertContext";
import notificationService from "@/services/api/notification.service";
// import { useAlerts } from "../../context/AlertContext";
// import notificationService from "../../services/notification.service";

const NotificationPrompt = () => {
  const { enablePush, pushEnabled } = useAlerts();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!notificationService.isSupported()) return;
      if (pushEnabled) return;

      const permission = notificationService.getPermission();
      const dismissed = localStorage.getItem("notif_prompt_dismissed");

      if (permission === "default" && !dismissed) {
        // Delay 3 seconds for better UX
        setTimeout(() => setShow(true), 3000);
      }
    };
    check();
  }, [pushEnabled]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await enablePush();
      setShow(false);
    } catch (err) {
      // error toast already shown
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("notif_prompt_dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in">
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Bell size={18} />
          <span className="font-semibold text-sm">Enable Notifications</span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded transition text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          Get instant browser notifications when alerts occur — even when the app
          is closed.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Not now
          </button>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Enabling..." : "Enable"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;