import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

// ── GET /api/news ────────────────────────────────────────────────────
export const listNews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, category, sort, q } = req.query as unknown as {
    page: number;
    limit: number;
    category?: string;
    sort: "latest" | "trending" | "most-viewed";
    q?: string;
  };

  const where: any = { status: "APPROVED" };
  if (category) where.categories = { some: { slug: category } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "most-viewed" ? { views: "desc" as const } : { publishedAt: "desc" as const };
  // "trending" is handled by the dedicated /api/news/trending endpoint,
  // which needs a time-windowed view-count aggregation that a simple
  // orderBy can't express. Falling back to latest here keeps this
  // endpoint fast and predictable if "trending" is passed by mistake.

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { categories: { select: { slug: true, name: true } } },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  res.json({
    articles,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ── GET /api/news/trending ───────────────────────────────────────────
export const getTrending = asyncHandler(async (req: Request, res: Response) => {
  const { window, limit } = req.query as unknown as { window: "24h" | "7d" | "30d"; limit: number };

  const windowMs = { "24h": 86_400_000, "7d": 7 * 86_400_000, "30d": 30 * 86_400_000 }[window];
  const since = new Date(Date.now() - windowMs);

  const grouped = await prisma.articleView.groupBy({
    by: ["articleId"],
    where: { viewedAt: { gte: since } },
    _count: { articleId: true },
    orderBy: { _count: { articleId: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) {
    // Cold-start fallback: not enough fresh view events yet, so surface
    // the highest all-time view count instead of an empty trending page.
    const fallback = await prisma.newsArticle.findMany({
      where: { status: "APPROVED" },
      orderBy: { views: "desc" },
      take: limit,
      include: { categories: { select: { slug: true, name: true } } },
    });
    return res.json({ articles: fallback, window, source: "all-time-fallback" });
  }

  const articles = await prisma.newsArticle.findMany({
    where: { id: { in: grouped.map((g) => g.articleId) } },
    include: { categories: { select: { slug: true, name: true } } },
  });

  const orderMap = new Map(grouped.map((g, i) => [g.articleId, i]));
  articles.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

  res.json({ articles, window, source: "view-events" });
});

// ── GET /api/news/:slug ───────────────────────────────────────────────
export const getArticleBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const article = await prisma.newsArticle.findUnique({
    where: { slug },
    include: { categories: { select: { slug: true, name: true } } },
  });

  if (!article || article.status !== "APPROVED") throw ApiError.notFound("Article not found");

  // Fire-and-forget view tracking: increments the counter and records an
  // event (used for trending calculations), but never blocks the response.
  const sessionId = (req.cookies?.vzai_session as string) || req.ip || "anonymous";
  prisma.$transaction([
    prisma.newsArticle.update({ where: { id: article.id }, data: { views: { increment: 1 } } }),
    prisma.articleView.create({
      data: {
        articleId: article.id,
        userId: req.user?.sub,
        sessionId: req.user ? undefined : sessionId,
      },
    }),
  ]).catch((err) => console.warn("View tracking failed:", err));

  res.json({ article });
});

// ── POST /api/news/:slug/click ───────────────────────────────────────
// Tracks outbound clicks to the original source (e.g. "Read full article").
export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const article = await prisma.newsArticle.findUnique({ where: { slug } });
  if (!article) throw ApiError.notFound("Article not found");

  await prisma.newsArticle.update({ where: { id: article.id }, data: { clicks: { increment: 1 } } });
  res.json({ message: "ok" });
});
