import type { ReactNode } from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 32,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <Link href="/" style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Cpu size={22} color="#fff" />
          </span>
        </Link>
        <h1 className="font-display" style={{ fontSize: 22, fontWeight: 800, textAlign: "center", color: "var(--text-primary)" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 6, marginBottom: 24 }}>
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: subtitle ? 0 : 24 }}>{children}</div>
      </div>
    </div>
  );
}

export function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
        }}
      />
    </label>
  );
}

export function AuthButton({ children, loading = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 10,
        background: "var(--accent)",
        color: "var(--accent-contrast)",
        border: "none",
        fontWeight: 700,
        fontSize: 14,
        cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
