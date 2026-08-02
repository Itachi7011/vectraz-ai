"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";
import type { Article } from "@/types";

const WINDOWS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "This week" },
  { value: "30d", label: "This month" },
] as const;

export default function TrendingPage() {
  const [window_, setWindow] = useState<(typeof WINDOWS)[number]["value"]>("24h");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ articles: Article[] }>(`/api/news/trending?window=${window_}&limit=20`)
      .then((d) => setArticles(d.articles))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [window_]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <TrendingUp size={22} color="var(--accent)" />
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>
          Trending
        </h1>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
        The most-read AI, chip, and GPU stories right now.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {WINDOWS.map((w) => (
          <button
            key={w.value}
            onClick={() => setWindow(w.value)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${window_ === w.value ? "var(--accent)" : "var(--border)"}`,
              background: window_ === w.value ? "var(--accent)" : "var(--bg-elevated)",
              color: window_ === w.value ? "var(--accent-contrast)" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {w.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
