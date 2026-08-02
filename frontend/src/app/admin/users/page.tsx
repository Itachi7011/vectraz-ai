"use client";

import { useEffect, useState } from "react";
import { Ban, CheckCircle2, Search } from "lucide-react";
import Swal from "sweetalert2";
import { apiFetch, ApiRequestError } from "@/lib/api";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
  blockedReason: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  subscriptions: { plan: string; status: string }[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  function load(q = "") {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (q) params.set("search", q);
    apiFetch<{ users: AdminUser[] }>(`/api/admin/users?${params.toString()}`)
      .then((d) => setUsers(d.users))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleBlock(user: AdminUser) {
    const { value: reason } = await Swal.fire({
      title: `Block ${user.name}?`,
      input: "text",
      inputLabel: "Reason (shown to the user)",
      inputPlaceholder: "e.g. Repeated spam reports",
      showCancelButton: true,
      confirmButtonText: "Block user",
      confirmButtonColor: "#e11d48",
    });
    if (!reason) return;
    try {
      await apiFetch(`/api/admin/users/${user.id}/block`, { method: "POST", body: { reason } });
      load(search);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err instanceof ApiRequestError ? err.message : "Try again." });
    }
  }

  async function handleUnblock(user: AdminUser) {
    try {
      await apiFetch(`/api/admin/users/${user.id}/unblock`, { method: "POST" });
      load(search);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err instanceof ApiRequestError ? err.message : "Try again." });
    }
  }

  return (
    <div>
      <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
        Users
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, maxWidth: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, padding: "9px 12px", borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(search)}
            placeholder="Search by name or email"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg-elevated)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-secondary)", textAlign: "left" }}>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                  Loading…
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.email}</div>
                  </Td>
                  <Td>{u.role}</Td>
                  <Td>{u.subscriptions[0]?.plan ?? "FREE"}</Td>
                  <Td>
                    <span style={{ color: u.isBlocked ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </Td>
                  <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    {u.role !== "ADMIN" &&
                      (u.isBlocked ? (
                        <ActionButton icon={CheckCircle2} label="Unblock" onClick={() => handleUnblock(u)} color="var(--success)" />
                      ) : (
                        <ActionButton icon={Ban} label="Block" onClick={() => handleBlock(u)} color="var(--danger)" />
                      ))}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{children}</td>;
}
function ActionButton({ icon: Icon, label, onClick, color }: { icon: typeof Ban; label: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: `1px solid ${color}`, background: "transparent", color, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
    >
      <Icon size={13} /> {label}
    </button>
  );
}
