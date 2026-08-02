"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, TrendingUp, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";
import type { Article, Category } from "@/types";

export default function HomePage() {
  const [trending, setTrending] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<{ articles: Article[] }>("/api/news/trending?limit=5"),
      apiFetch<{ categories: Category[] }>("/api/categories"),
    ])
      .then(([t, c]) => {
        setTrending(t.articles);
        setCategories(c.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "12", sort: "latest" });
    if (activeCategory) params.set("category", activeCategory);
    apiFetch<{ articles: Article[] }>(`/api/news?${params.toString()}`)
      .then((d) => setLatest(d.articles))
      .catch(() => setLatest([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "var(--gradient-hero)",
          padding: "72px 16px 90px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="mx-auto max-w-4xl text-center" style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              color: "#fff",
              marginBottom: 20,
            }}
          >
            <Sparkles size={13} /> Curated across 9+ sources, refreshed continuously
          </span>
          <h1
            className="font-display"
            style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}
          >
            AI, chips & silicon —<br /> all in one feed.
          </h1>
          <p style={{ marginTop: 16, fontSize: 16, color: "rgba(255,255,255,0.85)" }}>
            VectrazAI tracks artificial intelligence, GPUs, semiconductors, and everything adjacent —
            so you don&apos;t have to check ten different sites.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
            }}
            style={{ marginTop: 28, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.95)",
                borderRadius: 14,
                padding: "12px 16px",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <Search size={18} color="#4b5670" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search NVIDIA, TSMC, LLMs, export controls..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent" }}
              />
              <button
                type="submit"
                style={{
                  background: "#2456ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 lg:px-8" style={{ marginTop: -50, position: "relative", zIndex: 2 }}>
        {/* Trending strip */}
        {trending.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <TrendingUp size={18} color="var(--accent)" />
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                Trending now
              </h2>
              <Link href="/trending" style={{ marginLeft: "auto", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {trending.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}

        {/* Category filters + latest */}
        <section style={{ paddingBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              Latest articles
            </h2>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            <FilterChip label="All" active={activeCategory === null} onClick={() => setActiveCategory(null)} />
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                label={c.name}
                active={activeCategory === c.slug}
                onClick={() => setActiveCategory(c.slug)}
              />
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading articles…</div>
          ) : latest.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
              No articles yet — the aggregator runs automatically in the background.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent)" : "var(--bg-elevated)",
        color: active ? "var(--accent-contrast)" : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.18s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
