import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "var(--accent)",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: "var(--radius-md)",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: `${accent}1a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={19} color={accent} />
      </span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
      </div>
    </div>
  );
}
