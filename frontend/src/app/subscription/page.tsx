"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import Swal from "sweetalert2";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { apiFetch, ApiRequestError } from "@/lib/api";
import type { Subscription, SubscriptionPlan } from "@/types";

const PLANS: { plan: SubscriptionPlan; price: string; features: string[]; highlight?: boolean }[] = [
  { plan: "FREE", price: "$0/mo", features: ["Latest AI/chip news", "5 saved topic preferences", "Standard notifications"] },
  {
    plan: "PRO",
    price: "$9/mo",
    highlight: true,
    features: ["Everything in Free", "Unlimited topic preferences", "Priority trending signals", "Early access to new sources"],
  },
  {
    plan: "ENTERPRISE",
    price: "Contact us",
    features: ["Everything in Pro", "Team seats", "Custom category tracking", "Dedicated support"],
  },
];

export default function SubscriptionPage() {
  const { user, isLoading } = useRequireAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [updating, setUpdating] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ subscription: Subscription }>("/api/subscriptions/me").then((d) => setSubscription(d.subscription));
  }, [user]);

  async function handleChangePlan(plan: SubscriptionPlan) {
    setUpdating(plan);
    try {
      const data = await apiFetch<{ subscription: Subscription; message: string }>("/api/subscriptions/upgrade", {
        method: "POST",
        body: { plan },
      });
      setSubscription(data.subscription);
      Swal.fire({ icon: "success", title: "Plan updated", text: data.message });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Couldn't update plan", text: err instanceof ApiRequestError ? err.message : "Try again." });
    } finally {
      setUpdating(null);
    }
  }

  if (isLoading || !user) return <div style={{ padding: 64, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 999, background: "var(--accent-soft)", color: "var(--accent)" }}>
          <Sparkles size={13} /> Demo billing — no card required
        </span>
        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginTop: 16 }}>
          Choose your plan
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
          Payment integration isn&apos;t live yet — plan switches here are instant and free.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = subscription?.plan === p.plan;
          return (
            <div
              key={p.plan}
              style={{
                borderRadius: "var(--radius-lg)",
                padding: 28,
                background: p.highlight ? "var(--gradient-hero)" : "var(--bg-elevated)",
                border: `1px solid ${p.highlight ? "transparent" : "var(--border)"}`,
                color: p.highlight ? "#fff" : "var(--text-primary)",
                position: "relative",
              }}
            >
              {p.highlight && (
                <span style={{ position: "absolute", top: -12, right: 20, background: "#fff", color: "var(--accent)", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999 }}>
                  MOST POPULAR
                </span>
              )}
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{p.plan}</h2>
              <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8, marginBottom: 20 }}>{p.price}</div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "start", gap: 8, fontSize: 13 }}>
                    <Check size={15} style={{ marginTop: 2, flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChangePlan(p.plan)}
                disabled={isCurrent || updating !== null}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: isCurrent ? "default" : "pointer",
                  border: p.highlight ? "none" : "1px solid var(--border)",
                  background: isCurrent ? (p.highlight ? "rgba(255,255,255,0.25)" : "var(--bg-hover)") : p.highlight ? "#fff" : "var(--accent)",
                  color: isCurrent ? (p.highlight ? "#fff" : "var(--text-muted)") : p.highlight ? "var(--accent)" : "var(--accent-contrast)",
                }}
              >
                {isCurrent ? "Current plan" : updating === p.plan ? "Updating…" : `Switch to ${p.plan}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
