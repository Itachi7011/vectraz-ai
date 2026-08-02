"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight, Cpu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { ADMIN_NAV, type AdminNavItem } from "./navConfig";

export function AdminSidebar() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className="vectraz-admin-sidebar"
      style={{
        width: isExpanded ? 264 : 76,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "var(--bg-elevated)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 18, borderBottom: "1px solid var(--border)" }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "var(--gradient-hero)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Cpu size={18} color="#fff" />
        </span>
        {isExpanded && (
          <span className="font-display" style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
            Vectraz<span style={{ color: "var(--accent)" }}>AI</span> Admin
          </span>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
        {ADMIN_NAV.map((item, i) => (
          <NavNode key={i} item={item} depth={0} isExpanded={isExpanded} pathname={pathname} />
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "flex-start" : "center",
          gap: 8,
          margin: 10,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          color: "var(--text-secondary)",
          cursor: "pointer",
        }}
      >
        {isExpanded ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
        {isExpanded && <span style={{ fontSize: 12, fontWeight: 600 }}>Collapse</span>}
      </button>
    </aside>
  );
}

function NavNode({
  item,
  depth,
  isExpanded,
  pathname,
}: {
  item: AdminNavItem;
  depth: number;
  isExpanded: boolean;
  pathname: string;
}) {
  const [open, setOpen] = useState(true);

  if (item.type === "link") {
    const isActive = pathname === item.href.split("?")[0] && (depth > 0 || pathname === "/admin");
    return (
      <Link
        href={item.href}
        title={!isExpanded ? item.label : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 10px",
          paddingLeft: 10 + depth * 16,
          borderRadius: 9,
          fontSize: 13,
          fontWeight: isActive ? 700 : 500,
          color: isActive ? "var(--accent)" : "var(--text-secondary)",
          background: isActive ? "var(--accent-soft)" : "transparent",
          transition: "background-color 0.15s ease, color 0.15s ease",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        <item.icon size={16} style={{ flexShrink: 0 }} />
        {isExpanded && <span>{item.label}</span>}
      </Link>
    );
  }

  // Group (parent with children, no link of its own)
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        title={!isExpanded ? item.label : undefined}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 10px",
          paddingLeft: 10 + depth * 16,
          borderRadius: 9,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-secondary)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <item.icon size={16} style={{ flexShrink: 0 }} />
        {isExpanded && (
          <>
            <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
            <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
          </>
        )}
      </button>
      {isExpanded && open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
          {item.children.map((child, i) => (
            <NavNode key={i} item={child} depth={depth + 1} isExpanded={isExpanded} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}
