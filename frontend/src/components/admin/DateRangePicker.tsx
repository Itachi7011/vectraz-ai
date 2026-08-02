"use client";

export type DateRangeValue = "today" | "week" | "month" | "year" | "custom";

const OPTIONS: { value: DateRangeValue; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom" },
];

export function DateRangePicker({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  customFrom?: string;
  customTo?: string;
  onCustomChange?: (from: string, to: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: "7px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            border: `1px solid ${value === opt.value ? "var(--accent)" : "var(--border)"}`,
            background: value === opt.value ? "var(--accent)" : "var(--bg-elevated)",
            color: value === opt.value ? "var(--accent-contrast)" : "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          {opt.label}
        </button>
      ))}
      {value === "custom" && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomChange?.(e.target.value, customTo ?? "")}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: 12 }}
          />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomChange?.(customFrom ?? "", e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: 12 }}
          />
        </div>
      )}
    </div>
  );
}
