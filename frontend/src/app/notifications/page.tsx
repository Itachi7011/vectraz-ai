"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch } from "@/lib/api";
import type { NotificationItem } from "@/types";

export default function NotificationsPage() {
  const { user, isLoading } = useRequireAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch<{ notifications: NotificationItem[] }>("/api/notifications")
      .then((d) => setNotifications(d.notifications))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function markRead(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n)));
  }

  async function markAllRead() {
    await apiFetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
  }

  if (isLoading || !user) return <div style={{ padding: 64, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={20} color="var(--accent)" />
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
            Notifications
          </h1>
        </div>
        <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
          <CheckCheck size={15} /> Mark all read
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading…</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>You&apos;re all caught up.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => n.status === "UNREAD" && markRead(n.id)}
              style={{
                padding: 16,
                borderRadius: "var(--radius-md)",
                background: n.status === "UNREAD" ? "var(--accent-soft)" : "var(--bg-elevated)",
                border: "1px solid var(--border)",
                cursor: n.status === "UNREAD" ? "pointer" : "default",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{n.title}</span>
                {n.status === "UNREAD" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 5 }} />}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{n.message}</p>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(n.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: 24, textAlign: "center" }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
