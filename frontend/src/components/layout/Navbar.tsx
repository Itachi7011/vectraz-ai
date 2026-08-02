"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cpu,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  LogIn,
  UserPlus,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Newspaper,
  Layers,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { apiFetch } from "@/lib/api";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Newspaper },
  { href: "/trending", label: "Trending", icon: TrendingUp },
];

const CATEGORY_QUICK_LINKS = [
  { slug: "artificial-intelligence", name: "Artificial Intelligence" },
  { slug: "gpus", name: "GPUs" },
  { slug: "semiconductors-chips", name: "Semiconductors & Chips" },
  { slug: "machine-learning", name: "Machine Learning" },
  { slug: "robotics", name: "Robotics" },
  { slug: "ai-policy-regulation", name: "AI Policy & Regulation" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ unreadCount: number }>("/api/notifications/unread-count")
      .then((d) => setUnreadCount(d.unreadCount))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (categoriesRef.current && !categoriesRef.current.contains(target)) setCategoriesOpen(false);
      if (authRef.current && !authRef.current.contains(target)) setAuthOpen(false);
      if (userRef.current && !userRef.current.contains(target)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleAdminClick(kind: "login" | "signup") {
    setAuthOpen(false);
    Swal.fire({
      icon: "warning",
      title: "Restricted Area",
      text:
        kind === "login"
          ? "The admin console is restricted to authenticated VectrazAI administrators only. Unauthorized access attempts are logged."
          : "Administrator accounts are provisioned internally and cannot be self-registered. Contact the VectrazAI team if you believe you should have access.",
      confirmButtonText: "Understood",
      confirmButtonColor: "#2456ff",
      background: "var(--bg-elevated)",
      color: "var(--text-primary)",
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchValue.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    setMobileOpen(false);
  }

  return (
    <header
      className="vectraz-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "var(--bg-elevated)" : "var(--bg-primary)",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition: "background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link
          href="/"
          className="vectraz-navbar-logo flex items-center gap-2 shrink-0"
          style={{ color: "var(--text-primary)" }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-sm)" }}
          >
            <Cpu size={20} color="#fff" strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight hidden sm:inline">
            Vectraz<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="vectraz-navbar-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-secondary)",
                transition: "color 0.2s ease, background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}

          <div ref={categoriesRef} style={{ position: "relative" }}>
            <button
              onClick={() => setCategoriesOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={categoriesOpen}
              className="vectraz-navbar-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Layers size={16} />
              Categories
              <ChevronDown
                size={14}
                style={{ transition: "transform 0.2s ease", transform: categoriesOpen ? "rotate(180deg)" : "none" }}
              />
            </button>
            {categoriesOpen && (
              <div
                className="vectraz-navbar-dropdown"
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  left: 0,
                  width: 260,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  padding: 8,
                  animation: "vectraz-dropdown-in 0.16s ease",
                }}
              >
                {CATEGORY_QUICK_LINKS.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setCategoriesOpen(false)}
                    style={{ display: "block", padding: "9px 12px", borderRadius: 8, fontSize: 14, color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs">
          <div
            className="vectraz-navbar-search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "8px 12px",
              borderRadius: 10,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <Search size={16} color="var(--text-muted)" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search AI, chips, GPUs..."
              aria-label="Search articles"
              style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 14, color: "var(--text-primary)" }}
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <Link
              href="/notifications"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    minWidth: 18,
                    height: 18,
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
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {!user ? (
            <div ref={authRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAuthOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={authOpen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "var(--accent)",
                  color: "var(--accent-contrast)",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                Account <ChevronDown size={14} />
              </button>
              {authOpen && (
                <div
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
                    animation: "vectraz-dropdown-in 0.16s ease",
                  }}
                >
                  <DropdownItem href="/login" icon={LogIn} label="Login" onClick={() => setAuthOpen(false)} />
                  <DropdownItem href="/signup" icon={UserPlus} label="Sign up" onClick={() => setAuthOpen(false)} />
                  <div style={{ height: 1, background: "var(--border)", margin: "6px 4px" }} />
                  <DropdownButton icon={ShieldAlert} label="Admin login" onClick={() => handleAdminClick("login")} />
                  <DropdownButton icon={ShieldAlert} label="Admin signup" onClick={() => handleAdminClick("signup")} />
                </div>
              )}
            </div>
          ) : (
            <div ref={userRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
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
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : "var(--gradient-hero)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {!user.avatarUrl && user.name.charAt(0).toUpperCase()}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }} className="hidden sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>
              {userMenuOpen && (
                <div
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
                    animation: "vectraz-dropdown-in 0.16s ease",
                  }}
                >
                  <DropdownItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setUserMenuOpen(false)} />
                  <DropdownItem href="/profile" icon={UserIcon} label="Profile" onClick={() => setUserMenuOpen(false)} />
                  <DropdownItem href="/subscription" icon={Settings} label="Subscription" onClick={() => setUserMenuOpen(false)} />
                  {user.role === "ADMIN" && (
                    <DropdownItem href="/admin" icon={ShieldAlert} label="Admin console" onClick={() => setUserMenuOpen(false)} />
                  )}
                  <div style={{ height: 1, background: "var(--border)", margin: "6px 4px" }} />
                  <DropdownButton
                    icon={LogOut}
                    label="Log out"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await logout();
                      router.push("/");
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <button
            className="lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
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
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)", padding: 16 }}>
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 10,
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                style={{ background: "transparent", border: "none", outline: "none", width: "100%", color: "var(--text-primary)" }}
              />
            </div>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} style={{ padding: "10px 8px", color: "var(--text-primary)" }}>
                {link.label}
              </Link>
            ))}
            {CATEGORY_QUICK_LINKS.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setMobileOpen(false)} style={{ padding: "10px 8px", fontSize: 14, color: "var(--text-secondary)" }}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes vectraz-dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}

function DropdownItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof LogIn;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 14, color: "var(--text-primary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={16} color="var(--text-muted)" />
      {label}
    </Link>
  );
}

function DropdownButton({ icon: Icon, label, onClick }: { icon: typeof LogIn; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 8,
        fontSize: 14,
        color: "var(--text-primary)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={16} color="var(--text-muted)" />
      {label}
    </button>
  );
}
