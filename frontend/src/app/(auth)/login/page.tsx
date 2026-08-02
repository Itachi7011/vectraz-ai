"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard, AuthInput, AuthButton } from "@/components/ui/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requiresVerification) {
        router.push(`/verify?email=${encodeURIComponent(email)}&purpose=EMAIL_VERIFICATION`);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to your VectrazAI account">
      <form onSubmit={handleSubmit}>
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{error}</p>}
        <AuthButton type="submit" loading={loading}>
          Log in
        </AuthButton>
      </form>
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 20 }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
