"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard, AuthInput, AuthButton } from "@/components/ui/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password);
      router.push(`/verify?email=${encodeURIComponent(email)}&purpose=EMAIL_VERIFICATION`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Join VectrazAI to save preferences and track topics">
      <form onSubmit={handleSubmit}>
        <AuthInput label="Full name" value={name} onChange={setName} placeholder="Jane Doe" autoComplete="name" />
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
        <AuthInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters, 1 number, 1 symbol"
          autoComplete="new-password"
        />
        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{error}</p>}
        <AuthButton type="submit" loading={loading}>
          Create account
        </AuthButton>
      </form>
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 20 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
