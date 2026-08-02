"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Eye, MousePointerClick, Flag, ExternalLink, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Article } from "@/types";

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiFetch<{ article: Article }>(`/api/news/${params.slug}`)
      .then((d) => setArticle(d.article))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  async function handleReadFull() {
    if (article) {
      apiFetch(`/api/news/${article.slug}/click`, { method: "POST" }).catch(() => {});
      window.open(article.url, "_blank", "noopener,noreferrer");
    }
  }

  async function handleReport() {
    if (!user) {
      Swal.fire({ icon: "info", title: "Login required", text: "Please log in to report an article." });
      return;
    }
    const { value: reason } = await Swal.fire({
      title: "Report this article",
      input: "select",
      inputOptions: {
        INACCURATE: "Inaccurate information",
        SPAM: "Spam",
        OFFENSIVE: "Offensive content",
        DUPLICATE: "Duplicate article",
        OTHER: "Other",
      },
      showCancelButton: true,
      confirmButtonText: "Submit report",
      confirmButtonColor: "#2456ff",
    });
    if (!reason) return;
    try {
      await apiFetch(`/api/news/${article!.slug}/report`, { method: "POST", body: { reason } });
      Swal.fire({ icon: "success", title: "Thanks!", text: "Our team will review this article." });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Couldn't submit report",
        text: err instanceof ApiRequestError ? err.message : "Please try again.",
      });
    }
  }

  if (loading) {
    return <div style={{ padding: 64, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;
  }

  if (notFound || !article) {
    return (
      <div style={{ padding: 64, textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Article not found.</p>
        <Link href="/" style={{ color: "var(--accent)", fontWeight: 600 }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <Link
        href="/"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Back
      </Link>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {article.categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 999,
              background: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <h1 className="font-display" style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, lineHeight: 1.2, color: "var(--text-primary)" }}>
        {article.title}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
        <span>{article.sourceName}</span>
        {article.author && <span>By {article.author}</span>}
        <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Eye size={13} /> {article.views}
        </span>
      </div>

      {article.imageUrl && (
        <div style={{ marginTop: 24, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.imageUrl} alt={article.title} style={{ width: "100%", display: "block" }} />
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 17, lineHeight: 1.7, color: "var(--text-secondary)" }}>{article.summary}</p>

      <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
        <button
          onClick={handleReadFull}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            background: "var(--accent)",
            color: "var(--accent-contrast)",
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Read full article <ExternalLink size={15} />
        </button>
        <button
          onClick={handleReport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            background: "transparent",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <Flag size={15} /> Report
        </button>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
          <MousePointerClick size={13} /> {article.clicks} click-throughs
        </span>
      </div>
    </article>
  );
}
