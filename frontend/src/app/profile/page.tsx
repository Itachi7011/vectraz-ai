"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch, ApiRequestError } from "@/lib/api";
import type { Category } from "@/types";

export default function ProfilePage() {
  const { user, isLoading } = useRequireAuth();
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiFetch<{ categories: Category[] }>("/api/categories"),
      apiFetch<{ categories: Category[] }>("/api/preferences"),
    ]).then(([all, mine]) => {
      setCategories(all.categories);
      setSelectedSlugs(new Set(mine.categories.map((c) => c.slug)));
    });
  }, [user]);

  function toggleCategory(slug: string) {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await apiFetch("/api/auth/me", { method: "PATCH", body: { name } });
      await apiFetch("/api/preferences", { method: "PUT", body: { categorySlugs: Array.from(selectedSlugs) } });
      Swal.fire({ icon: "success", title: "Saved", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Couldn't save", text: err instanceof ApiRequestError ? err.message : "Try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      await apiFetch("/api/auth/me/avatar", { method: "POST", body: formData, isFormData: true });
      Swal.fire({ icon: "success", title: "Avatar updated", timer: 1500, showConfirmButton: false });
      window.location.reload();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: err instanceof ApiRequestError ? err.message : "Avatar uploads may be temporarily unavailable.",
      });
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    try {
      await apiFetch("/api/auth/me/change-password", { method: "POST", body: { currentPassword, newPassword } });
      setCurrentPassword("");
      setNewPassword("");
      Swal.fire({ icon: "success", title: "Password updated" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Couldn't update password", text: err instanceof ApiRequestError ? err.message : "Try again." });
    }
  }

  if (isLoading || !user) return <div style={{ padding: 64, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 28 }}>
        Profile settings
      </h1>

      <Section title="Avatar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : "var(--gradient-hero)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {!user.avatarUrl && user.name.charAt(0).toUpperCase()}
          </span>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}>
            Upload new photo
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </label>
        </div>
      </Section>

      <Section title="Basic info">
        <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", marginBottom: 4 }}
        />
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Email: {user.email}</p>
      </Section>

      <Section title="Topic preferences">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => toggleCategory(c.slug)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                border: `1px solid ${selectedSlugs.has(c.slug) ? "var(--accent)" : "var(--border)"}`,
                background: selectedSlugs.has(c.slug) ? "var(--accent)" : "transparent",
                color: selectedSlugs.has(c.slug) ? "var(--accent-contrast)" : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </Section>

      <button
        onClick={handleSaveProfile}
        disabled={saving}
        style={{ padding: "11px 22px", borderRadius: 10, background: "var(--accent)", color: "var(--accent-contrast)", border: "none", fontWeight: 700, cursor: "pointer", marginBottom: 40 }}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>

      <Section title="Change password">
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", marginBottom: 14 }}
        />
        <button
          onClick={handleChangePassword}
          style={{ padding: "10px 20px", borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer" }}
        >
          Update password
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28, padding: 20, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>{title}</h2>
      {children}
    </div>
  );
}
