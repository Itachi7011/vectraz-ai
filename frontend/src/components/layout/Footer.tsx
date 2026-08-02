"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cpu, ChevronUp, ChevronDown, ArrowUp, Github, Twitter, Linkedin, Rss } from "lucide-react";

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Trending", href: "/trending" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Artificial Intelligence", href: "/category/artificial-intelligence" },
      { label: "GPUs", href: "/category/gpus" },
      { label: "Semiconductors & Chips", href: "/category/semiconductors-chips" },
      { label: "Machine Learning", href: "/category/machine-learning" },
      { label: "Robotics", href: "/category/robotics" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "Subscription", href: "/subscription" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  const [expanded, setExpanded] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer
        className="vectraz-footer"
        style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", marginTop: 64 }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <Link href="/" className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "var(--gradient-hero)" }}
              >
                <Cpu size={16} color="#fff" />
              </span>
              <span className="font-display text-base font-bold">
                Vectraz<span style={{ color: "var(--accent)" }}>AI</span>
              </span>
            </Link>

            <button
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse footer" : "Expand footer"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-secondary)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              {expanded ? "Collapse" : "Expand"}
              {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          <div
            style={{
              maxHeight: expanded ? 800 : 0,
              overflow: "hidden",
              transition: "max-height 0.35s ease",
            }}
          >
            <div className="grid grid-cols-2 gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-1">
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  VectrazAI curates the latest news on artificial intelligence, GPUs, chips, and
                  semiconductors — aggregated from dozens of sources and filtered for signal, not noise.
                </p>
                <div className="mt-4 flex gap-2">
                  {[Twitter, Github, Linkedin, Rss].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      aria-label="Social link"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
              </div>

              {FOOTER_COLUMNS.map((col) => (
                <div key={col.title}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                    {col.title}
                  </h3>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "16px 0",
              fontSize: 12,
              color: "var(--text-muted)",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span>© {new Date().getFullYear()} VectrazAI. All rights reserved.</span>
            <span>Built for people who track AI, chips & silicon.</span>
          </div>
        </div>
      </footer>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 40,
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <ArrowUp size={18} />
        </button>
      )}
    </>
  );
}
