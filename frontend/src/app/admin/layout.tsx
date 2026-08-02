"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminFAB } from "@/components/admin/AdminFAB";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthorized, isLoading } = useRequireAdmin();

  if (isLoading || !isAuthorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Checking admin access…
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-secondary)" }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <AdminNavbar />
          <main style={{ flex: 1, padding: 24 }}>{children}</main>
        </div>
      </div>
      <AdminFAB />
    </SidebarProvider>
  );
}
