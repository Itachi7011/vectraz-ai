import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";

// ── GET /api/subscriptions/me ────────────────────────────────────────
export const getMySubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    subscription: subscription ?? { plan: "FREE", status: "ACTIVE", isDummyPayment: true },
  });
});

// ── POST /api/subscriptions/upgrade ──────────────────────────────────
// No real payment provider is wired up yet, so this is a dummy toggle
// that lets the UI/flow be fully built now and swapped for a real
// checkout integration later without changing the data model.
export const upgradeSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { plan } = req.body as { plan: "FREE" | "PRO" | "ENTERPRISE" };
  const userId = req.user!.sub;

  const existing = await prisma.subscription.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });

  const subscription = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: { plan, status: "ACTIVE", isDummyPayment: true, startDate: new Date(), endDate: null },
      })
    : await prisma.subscription.create({
        data: { userId, plan, status: "ACTIVE", isDummyPayment: true },
      });

  res.json({
    subscription,
    message:
      plan === "FREE"
        ? "You're now on the Free plan."
        : `You're now on the ${plan} plan (demo upgrade — no payment was charged).`,
  });
});

// ── POST /api/subscriptions/cancel ───────────────────────────────────
export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  await prisma.subscription.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "CANCELED", endDate: new Date() },
  });
  res.json({ message: "Subscription canceled." });
});
