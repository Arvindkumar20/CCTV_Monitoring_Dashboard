// frontend/src/hooks/useDetectionAlerts.js
import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner"; // ya jo bhi toast lib use karte ho

let socketInstance = null;

export function useDetectionAlerts() {
  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_APP_API_URL, {
        withCredentials: true,
      });
    }

    const socket = socketInstance;

    const handleAlert = (alert) => {
      const emoji = { person: "🚨", fire: "🔥", smoke: "💨" }[alert.type] || "⚠️";
      const label = { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[alert.type];

      toast.error(`${emoji} ${label} DETECTED`, {
        description: `${alert.cameraName} • ${(alert.confidence * 100).toFixed(0)}%`,
        duration: 10000,
        action: alert.snapshot
          ? {
              label: "View",
              onClick: () => window.open(alert.snapshot, "_blank"),
            }
          : undefined,
      });

      // Optional: play sound
      if (alert.type === "fire") {
        const audio = new Audio("/alarm.mp3");
        audio.play().catch(() => {});
      }
    };

    const handleWorkerFailed = ({ cameraId, reason }) => {
      toast.warning(`Detection stopped for camera ${cameraId}`, {
        description: reason,
      });
    };

    socket.on("detection:alert", handleAlert);
    socket.on("detection:worker-failed", handleWorkerFailed);

    return () => {
      socket.off("detection:alert", handleAlert);
      socket.off("detection:worker-failed", handleWorkerFailed);
    };
  }, []);
}