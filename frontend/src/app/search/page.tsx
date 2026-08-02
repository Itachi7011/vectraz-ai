"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";
import type { Article } from "@/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";
  const [input, setInput] = useState(initialQ);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setInput(initialQ);
    if (initialQ) runSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  function runSearch(q: string) {
    setLoading(true);
    setSearched(true);
    apiFetch<{ articles: Article[] }>(`/api/news?q=${encodeURIComponent(q)}&limit=24`)
      .then((d) => setArticles(d.articles))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    router.push(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>
        Search VectrazAI
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 14,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <SearchIcon size={18} color="var(--text-muted)" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search articles, companies, technologies..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            style={{ background: "var(--accent)", color: "var(--accent-contrast)", border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Searching…</div>
      ) : searched && articles.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          No results for &ldquo;{initialQ}&rdquo;. Try a different term.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
