"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Newspaper, Eye, CreditCard, Flag, Ban } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StatCard } from "@/components/admin/StatCard";
import { DateRangePicker, type DateRangeValue } from "@/components/admin/DateRangePicker";
import { TimeseriesChartCard } from "@/components/admin/charts/TimeseriesChartCard";
import { CategoryBarChartCard } from "@/components/admin/charts/CategoryBarChartCard";

type Overview = {
  totalUsers: number;
  newUsersInRange: number;
  totalArticles: number;
  articlesInRange: number;
  totalViews: number;
  activeSubscriptions: number;
  pendingReports: number;
  blockedUsers: number;
};

type Timeseries = {
  newUsers: { date: string; count: number }[];
  articlesPublished: { date: string; count: number }[];
  views: { date: string; count: number }[];
};

export default function AdminDashboardPage() {
  const [range, setRange] = useState<DateRangeValue>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [timeseries, setTimeseries] = useState<Timeseries | null>(null);
  const [categories, setCategories] = useState<{ name: string; clickCount: number; articleCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ range });
    if (range === "custom" && customFrom && customTo) {
      params.set("from", customFrom);
      params.set("to", customTo);
    }
    return params.toString();
  }, [range, customFrom, customTo]);

  useEffect(() => {
    setLoading(true);
    const qs = buildParams();
    Promise.all([
      apiFetch<Overview>(`/api/admin/analytics/overview?${qs}`),
      apiFetch<Timeseries>(`/api/admin/analytics/timeseries?${qs}`),
      apiFetch<{ categories: typeof categories }>("/api/admin/analytics/categories"),
    ])
      .then(([o, t, c]) => {
        setOverview(o);
        setTimeseries(t);
        setCategories(c.categories);
      })
      .finally(() => setLoading(false));
  }, [buildParams]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <DateRangePicker
          value={range}
          onChange={setRange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomChange={(f, t) => {
            setCustomFrom(f);
            setCustomTo(t);
          }}
        />
      </div>

      {loading || !overview ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading dashboard…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ marginBottom: 24 }}>
            <StatCard label="Total users" value={overview.totalUsers} icon={Users} />
            <StatCard label="New users in range" value={overview.newUsersInRange} icon={Users} accent="#22c55e" />
            <StatCard label="Total articles" value={overview.totalArticles} icon={Newspaper} accent="#f59e0b" />
            <StatCard label="Views in range" value={overview.totalViews} icon={Eye} accent="#8b5cf6" />
            <StatCard label="Active paid subs" value={overview.activeSubscriptions} icon={CreditCard} accent="#06b6d4" />
            <StatCard label="Articles in range" value={overview.articlesInRange} icon={Newspaper} />
            <StatCard label="Pending reports" value={overview.pendingReports} icon={Flag} accent="#ef4444" />
            <StatCard label="Blocked users" value={overview.blockedUsers} icon={Ban} accent="#ef4444" />
          </div>

          {timeseries && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2" style={{ marginBottom: 24 }}>
              <TimeseriesChartCard title="New users" data={timeseries.newUsers} color="#22c55e" />
              <TimeseriesChartCard title="Articles published" data={timeseries.articlesPublished} color="#f59e0b" />
              <TimeseriesChartCard title="Article views" data={timeseries.views} color="#8b5cf6" />
              <CategoryBarChartCard data={categories} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
