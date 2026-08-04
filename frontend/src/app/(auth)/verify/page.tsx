"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthCard, AuthButton } from "@/components/ui/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();

  const email = searchParams.get("email") ?? "";
  const purpose = (searchParams.get("purpose") as "EMAIL_VERIFICATION" | "LOGIN_2FA") ?? "EMAIL_VERIFICATION";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(email, code, purpose);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      await resendOtp(email, "EMAIL_VERIFICATION");
      setInfo("A new code has been sent. (In development, check the auth-service console.)");
      setCooldown(60);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't resend code.");
    }
  }

  return (
    <AuthCard title="Check your email" subtitle={`Enter the 6-digit code we sent to ${email || "your email"}`}>
      <form onSubmit={handleSubmit}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 12,
            textAlign: "center",
            marginBottom: 16,
          }}
        />
        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {info && <p style={{ color: "var(--success)", fontSize: 13, marginBottom: 12 }}>{info}</p>}
        <AuthButton type="submit" loading={loading} disabled={code.length !== 6}>
          Verify
        </AuthButton>
      </form>
      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        style={{
          width: "100%",
          marginTop: 16,
          background: "transparent",
          border: "none",
          color: cooldown > 0 ? "var(--text-muted)" : "var(--accent)",
          fontSize: 13,
          fontWeight: 600,
          cursor: cooldown > 0 ? "default" : "pointer",
        }}
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </AuthCard>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div style={{ padding: 64, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}