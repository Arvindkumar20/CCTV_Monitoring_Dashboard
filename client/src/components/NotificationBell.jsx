import useNotifications from "@/hooks/useNotifications";
import { useState } from "react";
// import useNotifications from "../hooks/useNotifications";

export default function NotificationBell({ user, token }) {
  const { notifications, unread, markRead, markAllRead } = useNotifications(user, token);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
        }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "red",
              color: "#fff",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 40,
            width: 360,
            maxHeight: 480,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <b>Notifications</b>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer" }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p style={{ padding: 16, color: "#666" }}>No notifications</p>
          )}

          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markRead(n._id)}
              style={{
                padding: 12,
                borderBottom: "1px solid #f3f4f6",
                background: n.isRead ? "#fff" : "#fef3c7",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {n.title}
                {n.severity === "critical" && (
                  <span style={{ color: "red", marginLeft: 6, fontSize: 11 }}>● CRITICAL</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
                {n.message}
              </div>
              {n.location && (
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  📍 {n.location}
                </div>
              )}
              <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                {new Date(n.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}