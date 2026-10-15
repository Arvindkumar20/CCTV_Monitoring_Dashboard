// // frontend/src/context/AlertContext.jsx
// import { useAuth } from "@/hooks/useAuth";
// import alertService from "@/services/api/alert.service";
// import notificationService from "@/services/api/notification.service";
// import socketService from "@/services/socket.service";
// import { getSoundMuted, playAlertSound, setSoundMuted } from "@/utils/sound";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   useRef,
// } from "react";
// import toast from "react-hot-toast";

// const AlertContext = createContext(null);

// export const AlertProvider = ({ children }) => {
//   const { user, token } = useAuth();

//   const [alerts, setAlerts] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [connected, setConnected] = useState(false);
//   const [pushEnabled, setPushEnabled] = useState(false);
//   const [soundMuted, setSoundMutedState] = useState(getSoundMuted());
//   const [loading, setLoading] = useState(false);

//   const soundMutedRef = useRef(soundMuted);
//   useEffect(() => {
//     soundMutedRef.current = soundMuted;
//   }, [soundMuted]);

//   // ═══════════════════════════════════════════════════════════
//   // ✅ SOCKET CONNECTION (sirf connect, listeners alag useEffect me)
//   // ═══════════════════════════════════════════════════════════
//   useEffect(() => {
//     if (!token) return;
//     console.log("🔌 [AlertContext] Connecting socket...");
//     socketService.connect(token);
//   }, [token]);

//   // ═══════════════════════════════════════════════════════════
//   // ✅ REAL-TIME ALERT HANDLER
//   // ═══════════════════════════════════════════════════════════
//   useEffect(() => {
//     if (!token) return;

//     const handleNewAlert = (alert) => {
//       console.log("🚨 [AlertContext] New alert:", alert);

//       setAlerts((prev) => [alert, ...prev].slice(0, 100));

//       if (!alert.acknowledged && !alert.isRead) {
//         setUnreadCount((c) => c + 1);
//       }

//       playAlertSound(alert.type, soundMutedRef.current);

//       const duration = alert.type === "fire" ? 12000 : 6000;

//       toast.custom(
//         (t) => (
//           <AlertToast
//             alert={alert}
//             onClose={() => toast.dismiss(t.id)}
//             onView={() => {
//               toast.dismiss(t.id);
//               window.location.href = `/alerts/${alert.id || alert._id}`;
//             }}
//           />
//         ),
//         {
//           duration,
//           position: "top-right",
//           id: `alert-${alert.id || alert._id}`,
//         }
//       );
//     };

//     const handleAcknowledged = ({ alertId }) => {
//       setAlerts((prev) =>
//         prev.map((a) =>
//           a._id === alertId || a.id === alertId
//             ? { ...a, acknowledged: true, isRead: true }
//             : a
//         )
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//     };

//     socketService.on("alert:new", handleNewAlert);
//     socketService.on("alert:acknowledged", handleAcknowledged);

//     return () => {
//       socketService.off("alert:new", handleNewAlert);
//       socketService.off("alert:acknowledged", handleAcknowledged);
//     };
//   }, [token]);

//   // ═══════════════════════════════════════════════════════════
//   // ✅ INITIAL LOAD
//   // ═══════════════════════════════════════════════════════════
//   const loadAlerts = useCallback(async (params = {}) => {
//     setLoading(true);
//     try {
//       const res = await alertService.list({ limit: 50, ...params });
//       const items = res.data?.items || res.items || [];
//       setAlerts(items);
//       const unread = items.filter((a) => !a.acknowledged && !a.isRead).length;
//       setUnreadCount(unread);
//     } catch (err) {
//       console.error("Failed to load alerts:", err);
//       toast.error("Failed to load alerts");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (user) loadAlerts();
//   }, [user, loadAlerts]);

//   // ═══════════════════════════════════════════════════════════
//   // ✅ ACTIONS
//   // ═══════════════════════════════════════════════════════════
//   const acknowledgeAlert = useCallback(async (alertId) => {
//     try {
//       await alertService.acknowledge(alertId);
//       setAlerts((prev) =>
//         prev.map((a) =>
//           a._id === alertId || a.id === alertId
//             ? { ...a, acknowledged: true, isRead: true }
//             : a
//         )
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//       socketService.acknowledgeAlert(alertId);
//     } catch (err) {
//       toast.error("Failed to acknowledge alert");
//     }
//   }, []);

//   const markAllRead = useCallback(async () => {
//     try {
//       await alertService.markAllRead();
//       setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true, isRead: true })));
//       setUnreadCount(0);
//     } catch (err) {
//       toast.error("Failed to mark all read");
//     }
//   }, []);

//   const retryAlert = useCallback(async (alertId) => {
//     try {
//       const res = await alertService.retry(alertId);
//       toast.success("Retry initiated");
//       return res;
//     } catch (err) {
//       toast.error("Retry failed");
//       throw err;
//     }
//   }, []);

//   const deleteAlert = useCallback(async (alertId) => {
//     try {
//       await alertService.remove(alertId);
//       setAlerts((prev) =>
//         prev.filter((a) => a._id !== alertId && a.id !== alertId)
//       );
//       toast.success("Alert deleted");
//     } catch (err) {
//       toast.error("Failed to delete");
//     }
//   }, []);

//   // ═══════════════════════════════════════════════════════════
//   // ✅ PUSH NOTIFICATIONS
//   // ═══════════════════════════════════════════════════════════
//   const enablePush = useCallback(async () => {
//     try {
//       await notificationService.subscribe();
//       setPushEnabled(true);
//       toast.success("Push notifications enabled");
//     } catch (err) {
//       toast.error(err.message || "Failed to enable push");
//       throw err;
//     }
//   }, []);

//   const disablePush = useCallback(async () => {
//     try {
//       await notificationService.unsubscribe();
//       setPushEnabled(false);
//       toast.success("Push notifications disabled");
//     } catch (err) {
//       toast.error("Failed to disable push");
//     }
//   }, []);

//   useEffect(() => {
//     if (!user) return;
//     (async () => {
//       const subbed = await notificationService.isSubscribed();
//       setPushEnabled(subbed);
//     })();
//   }, [user]);

//   // ═══════════════════════════════════════════════════════════
//   // ✅ SOUND TOGGLE
//   // ═══════════════════════════════════════════════════════════
//   const toggleSound = useCallback(() => {
//     const newMuted = !soundMuted;
//     setSoundMuted(newMuted);
//     setSoundMutedState(newMuted);
//     toast.success(newMuted ? "Sound muted" : "Sound enabled");
//   }, [soundMuted]);

//   // ═══════════════════════════════════════════════════════════
//   // ✅ TITLE UPDATE
//   // ═══════════════════════════════════════════════════════════
//   useEffect(() => {
//     const originalTitle = document.title.replace(/^\(\d+\)\s/, "");
//     if (unreadCount > 0) {
//       document.title = `(${unreadCount}) ${originalTitle}`;
//     } else {
//       document.title = originalTitle;
//     }
//   }, [unreadCount]);

//   const value = {
//     alerts,
//     unreadCount,
//     connected,
//     pushEnabled,
//     soundMuted,
//     loading,
//     loadAlerts,
//     acknowledgeAlert,
//     markAllRead,
//     retryAlert,
//     deleteAlert,
//     enablePush,
//     disablePush,
//     toggleSound,
//     socketService,
//     notificationService,
//   };

//   return (
//     <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
//   );
// };

// export const useAlerts = () => {
//   const ctx = useContext(AlertContext);
//   if (!ctx) throw new Error("useAlerts must be used within AlertProvider");
//   return ctx;
// };

// export default AlertContext;


// frontend/src/context/AlertContext.jsx
import { useAuth } from "@/hooks/useAuth";
import alertService from "@/services/api/alert.service";
import notificationService from "@/services/api/notification.service";
import socketService from "@/services/socket.service";
import { getSoundMuted, playAlertSound, setSoundMuted } from "@/utils/sound";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import toast from "react-hot-toast";

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [soundMuted, setSoundMutedState] = useState(getSoundMuted());
  const [loading, setLoading] = useState(false);

  // 🆕 Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const soundMutedRef = useRef(soundMuted);
  useEffect(() => {
    soundMutedRef.current = soundMuted;
  }, [soundMuted]);

  // ═══════════════════════════════════════════════════════════
  // ✅ SOCKET CONNECTION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!token) return;
    console.log("🔌 [AlertContext] Connecting socket...");
    socketService.connect(token);
  }, [token]);

  // ═══════════════════════════════════════════════════════════
  // ✅ REAL-TIME ALERT HANDLER
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!token) return;

    const handleNewAlert = (alert) => {
      console.log("🚨 [AlertContext] New alert:", alert);

      // 🆕 Sirf tab prepend karo jab page 1 pe ho
      // Warna user page 2 pe hai to uske list me naya alert na aaye
      setAlerts((prev) => {
        // Agar current page 1 pe hai to prepend
        // Warna sirf pagination total update karo
        if (pagination.page === 1) {
          const updated = [alert, ...prev];
          // Page ke limit se zyada na ho
          return updated.slice(0, pagination.limit);
        }
        return prev;
      });

      // 🆕 Total count badhao
      setPagination((p) => ({
        ...p,
        total: p.total + 1,
        pages: Math.ceil((p.total + 1) / p.limit),
      }));

      if (!alert.acknowledged && !alert.isRead) {
        setUnreadCount((c) => c + 1);
      }

      playAlertSound(alert.type, soundMutedRef.current);

      const duration = alert.type === "fire" ? 12000 : 6000;

      toast.custom(
        (t) => (
          <AlertToast
            alert={alert}
            onClose={() => toast.dismiss(t.id)}
            onView={() => {
              toast.dismiss(t.id);
              window.location.href = `/alerts/${alert.id || alert._id}`;
            }}
          />
        ),
        {
          duration,
          position: "top-right",
          id: `alert-${alert.id || alert._id}`,
        }
      );
    };

    const handleAcknowledged = ({ alertId }) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a._id === alertId || a.id === alertId
            ? { ...a, acknowledged: true, isRead: true }
            : a
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    };

    socketService.on("alert:new", handleNewAlert);
    socketService.on("alert:acknowledged", handleAcknowledged);

    return () => {
      socketService.off("alert:new", handleNewAlert);
      socketService.off("alert:acknowledged", handleAcknowledged);
    };
  }, [token, pagination.page, pagination.limit]);

  // ═══════════════════════════════════════════════════════════
  // ✅ LOAD ALERTS — pagination aware
  // ═══════════════════════════════════════════════════════════
  const loadAlerts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      // ✅ Default params
      const query = {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      };

      // ✅ Optional filters (sirf tab bhejo jab value ho)
      if (params.type) query.type = params.type;
      if (params.status) query.status = params.status;
      if (params.search) query.search = params.search;

      console.log("📡 [AlertContext] loadAlerts:", query);

      const res = await alertService.list(query);

      // ✅ Response structure handle — axios ya plain
      const payload = res.data || res;
      const items = payload.items || payload.alerts || [];
      const pag = payload.pagination || {
        page: query.page,
        limit: query.limit,
        total: items.length,
        pages: 1,
      };

      setAlerts(items);
      setPagination(pag);

      // ✅ Unread count — current page se (total nahi)
      // Agar tumhe total unread chahiye to API se `unreadCount` bhejwao
      const unread = items.filter(
        (a) => !a.acknowledged && !a.isRead
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("❌ Failed to load alerts:", err);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadAlerts({ page: 1, limit: 20 });
  }, [user, loadAlerts]);

  // ═══════════════════════════════════════════════════════════
  // ✅ ACTIONS
  // ═══════════════════════════════════════════════════════════
  const acknowledgeAlert = useCallback(async (alertId) => {
    try {
      await alertService.acknowledge(alertId);
      setAlerts((prev) =>
        prev.map((a) =>
          a._id === alertId || a.id === alertId
            ? { ...a, acknowledged: true, isRead: true }
            : a
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      socketService.acknowledgeAlert(alertId);
    } catch (err) {
      toast.error("Failed to acknowledge alert");
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await alertService.markAllRead();
      setAlerts((prev) =>
        prev.map((a) => ({ ...a, acknowledged: true, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      toast.error("Failed to mark all read");
    }
  }, []);

  const retryAlert = useCallback(async (alertId) => {
    try {
      const res = await alertService.retry(alertId);
      toast.success("Retry initiated");
      return res;
    } catch (err) {
      toast.error("Retry failed");
      throw err;
    }
  }, []);

  const deleteAlert = useCallback(async (alertId) => {
    try {
      await alertService.remove(alertId);
      setAlerts((prev) =>
        prev.filter((a) => a._id !== alertId && a.id !== alertId)
      );
      // 🆕 Total count kam karo
      setPagination((p) => ({
        ...p,
        total: Math.max(0, p.total - 1),
        pages: Math.max(1, Math.ceil((p.total - 1) / p.limit)),
      }));
      toast.success("Alert deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  // ✅ PUSH NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  const enablePush = useCallback(async () => {
    try {
      await notificationService.subscribe();
      setPushEnabled(true);
      toast.success("Push notifications enabled");
    } catch (err) {
      toast.error(err.message || "Failed to enable push");
      throw err;
    }
  }, []);

  const disablePush = useCallback(async () => {
    try {
      await notificationService.unsubscribe();
      setPushEnabled(false);
      toast.success("Push notifications disabled");
    } catch (err) {
      toast.error("Failed to disable push");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const subbed = await notificationService.isSubscribed();
      setPushEnabled(subbed);
    })();
  }, [user]);

  // ═══════════════════════════════════════════════════════════
  // ✅ SOUND TOGGLE
  // ═══════════════════════════════════════════════════════════
  const toggleSound = useCallback(() => {
    const newMuted = !soundMuted;
    setSoundMuted(newMuted);
    setSoundMutedState(newMuted);
    toast.success(newMuted ? "Sound muted" : "Sound enabled");
  }, [soundMuted]);

  // ═══════════════════════════════════════════════════════════
  // ✅ TITLE UPDATE
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const originalTitle = document.title.replace(/^\(\d+\)\s/, "");
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
  }, [unreadCount]);

  const value = {
    alerts,
    unreadCount,
    pagination,           // 🆕
    connected,
    pushEnabled,
    soundMuted,
    loading,
    loadAlerts,
    acknowledgeAlert,
    markAllRead,
    retryAlert,
    deleteAlert,
    enablePush,
    disablePush,
    toggleSound,
    socketService,
    notificationService,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertProvider");
  return ctx;
};

export default AlertContext;