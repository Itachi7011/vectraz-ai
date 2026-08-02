"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  article: { slug: string; title: string };
  user: { name: string; email: string };
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch<{ reports: Report[] }>("/api/admin/reports")
      .then((d) => setReports(d.reports))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string) {
    await apiFetch(`/api/admin/reports/${id}/resolve`, { method: "POST" });
    load();
  }

  return (
    <div>
      <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>
        Pending reports
      </h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading…</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>No pending reports. 🎉</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reports.map((r) => (
            <div key={r.id} style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <Link href={`/news/${r.article.slug}`} target="_blank" style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                    {r.article.title}
                  </Link>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    Reported by {r.user.name} ({r.user.email}) — <strong>{r.reason}</strong>
                  </div>
                  {r.details && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>{r.details}</p>}
                </div>
                <button
                  onClick={() => resolve(r.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, height: "fit-content", padding: "8px 14px", borderRadius: 8, border: "1px solid var(--success)", background: "transparent", color: "var(--success)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  <CheckCircle2 size={14} /> Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
