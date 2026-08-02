"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, UserPlus2, FileWarning, RefreshCcw, X } from "lucide-react";
import Swal from "sweetalert2";
import { apiFetch, ApiRequestError } from "@/lib/api";

export function AdminFAB() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleRefresh() {
    setOpen(false);
    try {
      await apiFetch("/api/admin/news/refresh", { method: "POST" });
      Swal.fire({ icon: "success", title: "Aggregation triggered", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err instanceof ApiRequestError ? err.message : "Try again." });
    }
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 45, display: "flex", flexDirection: "column-reverse", alignItems: "flex-end", gap: 10 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close admin quick actions" : "Open admin quick actions"}
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-lg)",
          cursor: "pointer",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease",
        }}
      >
        {open ? <X size={20} /> : <Wrench size={20} />}
      </button>

      {open && (
        <>
          <AdminFabAction icon={RefreshCcw} label="Refresh news now" onClick={handleRefresh} />
          <AdminFabAction icon={FileWarning} label="Pending reports" onClick={() => { setOpen(false); router.push("/admin/reports"); }} />
          <AdminFabAction icon={UserPlus2} label="Manage users" onClick={() => { setOpen(false); router.push("/admin/users"); }} />
        </>
      )}
    </div>
  );
}

function AdminFabAction({ icon: Icon, label, onClick }: { icon: typeof Wrench; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px 9px 12px",
        borderRadius: 12,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        boxShadow: "var(--shadow-md)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
        <Icon size={13} />
      </span>
      {label}
    </button>
  );
}
