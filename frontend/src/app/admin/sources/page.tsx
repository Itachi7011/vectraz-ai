"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import Swal from "sweetalert2";
import { apiFetch, ApiRequestError } from "@/lib/api";

type SourceHealth = {
  sourceType: string;
  lastRunAt: string | null;
  lastRunSuccess: boolean | null;
  lastErrorMessage: string | null;
  successRate: number | null;
  totalArticlesFetched: number;
};

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    setLoading(true);
    apiFetch<{ sources: SourceHealth[] }>("/api/admin/news-sources/health")
      .then((d) => setSources(d.sources))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function triggerRefresh() {
    setRefreshing(true);
    try {
      await apiFetch("/api/admin/news/refresh", { method: "POST" });
      Swal.fire({ icon: "success", title: "Aggregation started", text: "Refresh the page in ~30s to see updated logs.", timer: 2500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err instanceof ApiRequestError ? err.message : "Try again." });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
          News source health
        </h1>
        <button
          onClick={triggerRefresh}
          disabled={refreshing}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10, background: "var(--accent)", color: "var(--accent-contrast)", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          <RefreshCcw size={14} /> Trigger refresh now
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => (
            <div key={s.sourceType} style={{ padding: 18, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{s.sourceType}</span>
                {s.lastRunSuccess ? <CheckCircle2 size={16} color="var(--success)" /> : <XCircle size={16} color="var(--danger)" />}
              </div>
              <Row label="Success rate" value={s.successRate !== null ? `${s.successRate}%` : "—"} />
              <Row label="Total articles fetched" value={s.totalArticlesFetched} />
              <Row label="Last run" value={s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : "Never"} />
              {s.lastErrorMessage && (
                <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 8, lineHeight: 1.5 }}>{s.lastErrorMessage}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
      <span>{label}</span>
      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
