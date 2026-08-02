"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function CategoryBarChartCard({
  data,
}: {
  data: { name: string; clickCount: number; articleCount: number }[];
}) {
  return (
    <div style={{ padding: 20, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Category popularity</h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "var(--text-primary)" }}
            />
            <Bar dataKey="clickCount" name="Clicks" fill="#2456ff" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
