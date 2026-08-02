"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme, THEMES } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="vectraz-theme-toggle" ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Change theme"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="vectraz-navbar-icon-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--bg-elevated)",
          color: "var(--text-secondary)",
          cursor: "pointer",
          transition: "transform 0.2s ease, color 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px) scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0) scale(1)")}
      >
        <Palette size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="vectraz-theme-dropdown"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: 220,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: 8,
            zIndex: 60,
            animation: "vectraz-dropdown-in 0.16s ease",
          }}
        >
          {THEMES.map((t) => (
            <button
              key={t.value}
              role="menuitem"
              onClick={() => {
                setTheme(t.value);
                setOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                background: theme === t.value ? "var(--accent-soft)" : "transparent",
                color: "var(--text-primary)",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = theme === t.value ? "var(--accent-soft)" : "transparent")
              }
            >
              <span>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.description}</div>
              </span>
              {theme === t.value && <Check size={16} color="var(--accent)" />}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes vectraz-dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
