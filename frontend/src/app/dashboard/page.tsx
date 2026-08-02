"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Settings, Bell, CreditCard } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch } from "@/lib/api";
import { NewsCard } from "@/components/news/NewsCard";
import type { Article, Category, Subscription } from "@/types";

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const [feed, setFeed] = useState<Article[]>([]);
  const [preferredCategories, setPreferredCategories] = useState<Category[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiFetch<{ categories: Category[] }>("/api/preferences"),
      apiFetch<{ subscription: Subscription }>("/api/subscriptions/me"),
    ])
      .then(async ([prefs, sub]) => {
        setPreferredCategories(prefs.categories);
        setSubscription(sub.subscription);
        const category = prefs.categories[0]?.slug;
        const data = await apiFetch<{ articles: Article[] }>(
          `/api/news?limit=8${category ? `&category=${category}` : ""}`
        );
        setFeed(data.articles);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !user) return <div style={{ padding: 64, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <LayoutDashboard size={22} color="var(--accent)" />
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>
          Welcome back, {user.name.split(" ")[0]}
        </h1>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Here&apos;s what&apos;s new in your feed.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ marginBottom: 32 }}>
        <QuickLinkCard href="/profile" icon={Settings} title="Profile" desc="Update your details & preferences" />
        <QuickLinkCard href="/subscription" icon={CreditCard} title={`Plan: ${subscription?.plan ?? "FREE"}`} desc="Manage your subscription" />
        <QuickLinkCard href="/notifications" icon={Bell} title="Notifications" desc="See what you've missed" />
      </div>

      {preferredCategories.length > 0 && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          Personalized based on: {preferredCategories.map((c) => c.name).join(", ")}
        </p>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Loading your feed…</div>
      ) : feed.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          No articles yet. <Link href="/profile" style={{ color: "var(--accent)" }}>Set your topic preferences →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {feed.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuickLinkCard({ href, icon: Icon, title, desc }: { href: string; icon: typeof Settings; title: string; desc: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 18,
        borderRadius: "var(--radius-md)",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
      }}
    >
      <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color="var(--accent)" />
      </span>
      <span>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div>
      </span>
    </Link>
  );
}
