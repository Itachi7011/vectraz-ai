"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ArrowUp, Palette, MessageSquarePlus, X } from "lucide-react";
import { useTheme, THEMES } from "@/context/ThemeContext";

const ACTIONS = [
  { key: "search", label: "Search", icon: Search },
  { key: "top", label: "Back to top", icon: ArrowUp },
  { key: "theme", label: "Cycle theme", icon: Palette },
  { key: "feedback", label: "Suggest a source", icon: MessageSquarePlus },
] as const;

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  function handleAction(key: (typeof ACTIONS)[number]["key"]) {
    setOpen(false);
    if (key === "search") router.push("/search");
    if (key === "top") window.scrollTo({ top: 0, behavior: "smooth" });
    if (key === "theme") {
      const idx = THEMES.findIndex((t) => t.value === theme);
      setTheme(THEMES[(idx + 1) % THEMES.length].value);
    }
    if (key === "feedback") router.push("/contact");
  }

  return (
    <div
      className="vectraz-fab"
      style={{ position: "fixed", bottom: 28, right: 24, zIndex: 45, display: "flex", flexDirection: "column-reverse", alignItems: "flex-end", gap: 12 }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close quick actions" : "Open quick actions"}
        aria-expanded={open}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--gradient-hero)",
          border: "none",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-lg)",
          cursor: "pointer",
          transform: open ? "rotate(135deg)" : "rotate(0deg)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </button>

      {open &&
        ACTIONS.map((action, i) => (
          <button
            key={action.key}
            onClick={() => handleAction(action.key)}
            className="vectraz-fab-action"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px 10px 12px",
              borderRadius: 999,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-md)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              animation: `vectraz-fab-pop 0.22s ease both`,
              animationDelay: `${i * 0.04}s`,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
            >
              <action.icon size={14} />
            </span>
            {action.label}
          </button>
        ))}

      <style>{`
        @keyframes vectraz-fab-pop {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
