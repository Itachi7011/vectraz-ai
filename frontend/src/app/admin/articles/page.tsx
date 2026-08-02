"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Flag } from "lucide-react";
import { apiFetch } from "@/lib/api";

type AdminArticle = {
  id: string;
  title: string;
  sourceName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  publishedAt: string;
  views: number;
  categories: { slug: string; name: string }[];
  _count: { reports: number };
};

export default function AdminArticlesPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as AdminArticle["status"] | null;
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (status) params.set("status", status);
    apiFetch<{ articles: AdminArticle[] }>(`/api/admin/articles?${params.toString()}`)
      .then((d) => setArticles(d.articles))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function updateStatus(id: string, action: "approve" | "reject") {
    await apiFetch(`/api/admin/articles/${id}/${action}`, { method: "POST" });
    load();
  }

  return (
    <div>
      <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
        Articles {status ? `— ${status}` : ""}
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: 13 }}>
        {status ? "Filtered via sidebar" : "Showing all statuses"} — {articles.length} articles
      </p>

      <div style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg-elevated)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bg-secondary)", textAlign: "left" }}>
              <Th>Title</Th>
              <Th>Source</Th>
              <Th>Status</Th>
              <Th>Views</Th>
              <Th>Reports</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Loading…</td>
              </tr>
            ) : (
              articles.map((a) => (
                <tr key={a.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", maxWidth: 340 }}>{a.title}</div>
                  </Td>
                  <Td>{a.sourceName}</Td>
                  <Td>
                    <StatusBadge status={a.status} />
                  </Td>
                  <Td>{a.views}</Td>
                  <Td>
                    {a._count.reports > 0 ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--danger)", fontWeight: 700 }}>
                        <Flag size={12} /> {a._count.reports}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {a.status !== "APPROVED" && (
                        <IconBtn icon={CheckCircle2} color="var(--success)" onClick={() => updateStatus(a.id, "approve")} title="Approve" />
                      )}
                      {a.status !== "REJECTED" && (
                        <IconBtn icon={XCircle} color="var(--danger)" onClick={() => updateStatus(a.id, "reject")} title="Reject" />
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminArticle["status"] }) {
  const color = status === "APPROVED" ? "var(--success)" : status === "REJECTED" ? "var(--danger)" : "var(--warning)";
  return <span style={{ color, fontWeight: 700, fontSize: 12 }}>{status}</span>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{children}</td>;
}
function IconBtn({ icon: Icon, color, onClick, title }: { icon: typeof CheckCircle2; color: string; onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${color}`, background: "transparent", color, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      <Icon size={14} />
    </button>
  );
}
