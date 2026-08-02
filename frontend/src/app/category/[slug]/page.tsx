"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Layers } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";
import type { Article, Category } from "@/types";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [sort, setSort] = useState<"latest" | "most-viewed">("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ category: Category }>(`/api/categories/${params.slug}`)
      .then((d) => setCategory(d.category))
      .catch(() => setCategory(null));
    apiFetch(`/api/categories/${params.slug}/click`, { method: "POST" }).catch(() => {});
  }, [params.slug]);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ articles: Article[] }>(`/api/news?category=${params.slug}&sort=${sort}&limit=24`)
      .then((d) => setArticles(d.articles))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [params.slug, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Layers size={20} color="var(--accent)" />
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>
          {category?.name ?? "Category"}
        </h1>
      </div>
      {category?.description && <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>{category.description}</p>}

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["latest", "most-viewed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${sort === s ? "var(--accent)" : "var(--border)"}`,
              background: sort === s ? "var(--accent)" : "var(--bg-elevated)",
              color: sort === s ? "var(--accent-contrast)" : "var(--text-secondary)",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {s === "latest" ? "Latest" : "Most viewed"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading…</div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>No articles in this category yet.</div>
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
