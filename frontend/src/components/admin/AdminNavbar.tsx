"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, ChevronDown, User as UserIcon, LogOut, Globe, RefreshCcw } from "lucide-react";
import Swal from "sweetalert2";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";

export function AdminNavbar() {
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingReports, setPendingReports] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ pendingReports: number }>("/api/admin/analytics/overview?range=today")
      .then((d: any) => setPendingReports(d.pendingReports ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleRefreshNews() {
    setRefreshing(true);
    try {
      await apiFetch("/api/admin/news/refresh", { method: "POST" });
      Swal.fire({ icon: "success", title: "Refresh started", text: "News aggregation is running in the background.", timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Couldn't trigger refresh", text: err instanceof ApiRequestError ? err.message : "Try again." });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <header
      className="vectraz-admin-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 20px",
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--bg-elevated)",
          color: "var(--text-secondary)",
          cursor: "pointer",
          transition: "transform 0.18s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <Menu size={17} />
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: 1,
          maxWidth: 360,
          padding: "8px 12px",
          borderRadius: 10,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
        className="vectraz-admin-search"
      >
        <Search size={15} color="var(--text-muted)" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users, articles..."
          style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: 13, color: "var(--text-primary)" }}
        />
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={handleRefreshNews}
          disabled={refreshing}
          title="Trigger news aggregation now"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCcw size={14} style={{ animation: refreshing ? "vectraz-spin 1s linear infinite" : "none" }} />
          <span className="hidden md:inline">Refresh news</span>
        </button>

        <Link
          href="/"
          title="View public site"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
          }}
        >
          <Globe size={16} />
        </Link>

        <Link
          href="/admin/reports"
          aria-label={`Pending reports${pendingReports > 0 ? `, ${pendingReports}` : ""}`}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
            transition: "transform 0.18s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <Bell size={16} />
          {pendingReports > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 17,
                height: 17,
                borderRadius: 999,
                background: "var(--danger)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {pendingReports > 9 ? "9+" : pendingReports}
            </span>
          )}
        </Link>

        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 4,
              paddingRight: 10,
              borderRadius: 999,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: user?.avatarUrl ? `url(${user.avatarUrl}) center/cover` : "var(--gradient-hero)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {!user?.avatarUrl && user?.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {user?.name}
            </span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 10px)",
                width: 200,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: 8,
              }}
            >
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13, color: "var(--text-primary)" }}
              >
                <UserIcon size={15} color="var(--text-muted)" /> Profile
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                  router.push("/");
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--text-primary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <LogOut size={15} color="var(--text-muted)" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes vectraz-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
