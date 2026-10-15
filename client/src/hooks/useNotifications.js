import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API, { autoConnect: false });

export default function useNotifications(user, token) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  // Initial fetch
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setNotifications(data.items);
        setUnread(data.unread);
      })
      .catch(() => {});
  }, [token]);

  // Socket realtime
  useEffect(() => {
    if (!user?._id) return;
    socket.connect();
    socket.emit("join", user._id);

    const handler = (n) => {
      setNotifications((prev) => [n, ...prev]);
      setUnread((u) => u + 1);

      // Browser notification (agar website open hai tab)
      if (Notification.permission === "granted") {
        new Notification(n.title, {
          body: n.message,
          icon: "/icon-192.png",
        });
      }
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
      socket.disconnect();
    };
  }, [user?._id]);

  const markRead = useCallback(
    async (id) => {
      await axios.patch(
        `${API}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    },
    [token]
  );

  const markAllRead = useCallback(async () => {
    await axios.patch(
      `${API}/api/notifications/read-all`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  }, [token]);

  return { notifications, unread, markRead, markAllRead };
}