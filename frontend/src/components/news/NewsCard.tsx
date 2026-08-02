import Link from "next/link";
import { Eye, Clock } from "lucide-react";
import type { Article } from "@/types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NewsCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="vectraz-news-card"
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        e.currentTarget.style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div
        style={{
          height: featured ? 220 : 160,
          background: article.imageUrl ? `url(${article.imageUrl}) center/cover` : "var(--gradient-hero)",
          position: "relative",
        }}
      >
        {article.categories[0] && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              backdropFilter: "blur(4px)",
            }}
          >
            {article.categories[0].name}
          </span>
        )}
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1, gap: 8 }}>
        <h3
          style={{
            fontSize: featured ? 18 : 15,
            fontWeight: 700,
            lineHeight: 1.35,
            color: "var(--text-primary)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {article.summary}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <span>{article.sourceName}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Eye size={12} /> {article.views}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Clock size={12} /> {timeAgo(article.publishedAt)}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
