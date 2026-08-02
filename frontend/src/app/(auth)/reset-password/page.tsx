"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthCard, AuthInput, AuthButton } from "@/components/ui/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Set a new password" subtitle="Enter the code from your email and your new password">
      <form onSubmit={handleSubmit}>
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <AuthInput label="Reset code" value={code} onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))} placeholder="000000" />
        <AuthInput label="New password" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{error}</p>}
        <AuthButton type="submit" loading={loading}>
          Reset password
        </AuthButton>
      </form>
    </AuthCard>
  );
}
