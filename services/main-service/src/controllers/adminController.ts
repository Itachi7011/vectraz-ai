import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { resolveDateRange } from "../utils/dateRange";
import { runAggregation } from "../services/newsAggregator/aggregate";
import { runWeeklyDigest } from "../services/digest/generateDigest";

// ── GET /api/admin/users ─────────────────────────────────────────────
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, role, blocked } = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
    role?: "USER" | "ADMIN";
    blocked?: "true" | "false";
  };

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (blocked) where.isBlocked = blocked === "true";

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        blockedReason: true,
        isEmailVerified: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1, select: { plan: true, status: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// ── POST /api/admin/users/:id/block ──────────────────────────────────
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as { reason: string };
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) throw ApiError.notFound("User not found");
  if (target.role === "ADMIN") throw ApiError.badRequest("Cannot block another admin.");

  await prisma.user.update({
    where: { id: target.id },
    data: { isBlocked: true, blockedReason: reason },
  });
  await prisma.auditLog.create({
    data: {
      action: "USER_BLOCKED",
      performedById: req.user!.sub,
      targetType: "User",
      targetId: target.id,
      metadata: { reason },
    },
  });

  res.json({ message: "User blocked." });
});

// ── POST /api/admin/users/:id/unblock ────────────────────────────────
export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) throw ApiError.notFound("User not found");

  await prisma.user.update({ where: { id: target.id }, data: { isBlocked: false, blockedReason: null } });
  await prisma.auditLog.create({
    data: { action: "USER_UNBLOCKED", performedById: req.user!.sub, targetType: "User", targetId: target.id },
  });

  res.json({ message: "User unblocked." });
});

// ── GET /api/admin/analytics/overview ────────────────────────────────
export const analyticsOverview = asyncHandler(async (req: Request, res: Response) => {
  const { range, from, to } = req.query as unknown as { range: any; from?: Date; to?: Date };
  const { from: rangeFrom, to: rangeTo } = resolveDateRange(range, from, to);

  const [
    totalUsers,
    newUsersInRange,
    totalArticles,
    articlesInRange,
    totalViews,
    activeSubscriptions,
    pendingReports,
    blockedUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: rangeFrom, lte: rangeTo } } }),
    prisma.newsArticle.count({ where: { status: "APPROVED" } }),
    prisma.newsArticle.count({ where: { createdAt: { gte: rangeFrom, lte: rangeTo } } }),
    prisma.articleView.count({ where: { viewedAt: { gte: rangeFrom, lte: rangeTo } } }),
    prisma.subscription.count({ where: { status: "ACTIVE", plan: { not: "FREE" } } }),
    prisma.articleReport.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { isBlocked: true } }),
  ]);

  res.json({
    range: { range, from: rangeFrom, to: rangeTo },
    totalUsers,
    newUsersInRange,
    totalArticles,
    articlesInRange,
    totalViews,
    activeSubscriptions,
    pendingReports,
    blockedUsers,
  });
});

// ── GET /api/admin/analytics/timeseries ──────────────────────────────
// Day-bucketed counts for line/bar charts: new users, articles published, views.
export const analyticsTimeseries = asyncHandler(async (req: Request, res: Response) => {
  const { range, from, to } = req.query as unknown as { range: any; from?: Date; to?: Date };
  const { from: rangeFrom, to: rangeTo } = resolveDateRange(range, from, to);

  const [users, articles, views] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: rangeFrom, lte: rangeTo } }, select: { createdAt: true } }),
    prisma.newsArticle.findMany({
      where: { createdAt: { gte: rangeFrom, lte: rangeTo } },
      select: { createdAt: true },
    }),
    prisma.articleView.findMany({
      where: { viewedAt: { gte: rangeFrom, lte: rangeTo } },
      select: { viewedAt: true },
    }),
  ]);

  const bucket = (dates: Date[]) => {
    const map = new Map<string, number>();
    for (const d of dates) {
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  res.json({
    newUsers: bucket(users.map((u) => u.createdAt)),
    articlesPublished: bucket(articles.map((a) => a.createdAt)),
    views: bucket(views.map((v) => v.viewedAt)),
  });
});

// ── GET /api/admin/analytics/categories ──────────────────────────────
export const analyticsCategoryBreakdown = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    select: { slug: true, name: true, clickCount: true, _count: { select: { articles: true } } },
    orderBy: { clickCount: "desc" },
  });
  res.json({
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      clickCount: c.clickCount,
      articleCount: c._count.articles,
    })),
  });
});

// ── GET /api/admin/news-sources/health ───────────────────────────────
export const newsSourceHealth = asyncHandler(async (_req: Request, res: Response) => {
  const logs = await prisma.newsSourceLog.findMany({
    orderBy: { ranAt: "desc" },
    take: 200, // last 200 runs across all sources is plenty for a health widget
  });

  const bySource = new Map<string, typeof logs>();
  for (const log of logs) {
    const arr = bySource.get(log.sourceType) ?? [];
    arr.push(log);
    bySource.set(log.sourceType, arr);
  }

  const summary = Array.from(bySource.entries()).map(([sourceType, entries]) => {
    const successCount = entries.filter((e) => e.success).length;
    return {
      sourceType,
      lastRunAt: entries[0]?.ranAt,
      lastRunSuccess: entries[0]?.success ?? null,
      lastErrorMessage: entries.find((e) => !e.success)?.errorMessage ?? null,
      successRate: entries.length ? Math.round((successCount / entries.length) * 100) : null,
      totalArticlesFetched: entries.reduce((sum, e) => sum + e.articlesFetched, 0),
    };
  });

  res.json({ sources: summary });
});

// ── POST /api/admin/news/refresh ─────────────────────────────────────
export const triggerNewsRefresh = asyncHandler(async (req: Request, res: Response) => {
  // Don't block the HTTP response on a potentially slow multi-source fetch.
  runAggregation().catch((err) => console.error("Manual aggregation trigger failed:", err));
  await prisma.auditLog.create({
    data: { action: "NEWS_REFRESH_TRIGGERED", performedById: req.user!.sub },
  });
  res.status(202).json({ message: "News aggregation started in the background." });
});

// ── POST /api/admin/digest/send-now ──────────────────────────────────
export const triggerDigestNow = asyncHandler(async (req: Request, res: Response) => {
  runWeeklyDigest().catch((err) => console.error("Manual digest trigger failed:", err));
  await prisma.auditLog.create({
    data: { action: "DIGEST_TRIGGERED", performedById: req.user!.sub },
  });
  res.status(202).json({ message: "Digest send started in the background." });
});

// ── GET /api/admin/articles ──────────────────────────────────────────
export const listArticlesAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query as unknown as { page: number; limit: number; status?: any };
  const where = status ? { status } : {};

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { categories: { select: { slug: true, name: true } }, _count: { select: { reports: true } } },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  res.json({ articles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

// ── POST /api/admin/articles/:id/approve ─────────────────────────────
export const approveArticle = asyncHandler(async (req: Request, res: Response) => {
  await prisma.newsArticle.update({ where: { id: req.params.id }, data: { status: "APPROVED" } });
  res.json({ message: "Article approved." });
});

// ── POST /api/admin/articles/:id/reject ──────────────────────────────
export const rejectArticle = asyncHandler(async (req: Request, res: Response) => {
  await prisma.newsArticle.update({ where: { id: req.params.id }, data: { status: "REJECTED" } });
  res.json({ message: "Article rejected." });
});

// ── GET /api/admin/reports ───────────────────────────────────────────
export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const reports = await prisma.articleReport.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      article: { select: { slug: true, title: true } },
      user: { select: { name: true, email: true } },
    },
  });
  res.json({ reports });
});

// ── POST /api/admin/reports/:id/resolve ──────────────────────────────
export const resolveReport = asyncHandler(async (req: Request, res: Response) => {
  await prisma.articleReport.update({ where: { id: req.params.id }, data: { status: "REVIEWED" } });
  res.json({ message: "Report resolved." });
});
