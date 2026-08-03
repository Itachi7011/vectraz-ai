import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

// ── GET /api/saved ────────────────────────────────────────────────────
export const listSavedArticles = asyncHandler(async (req: Request, res: Response) => {
  const saved = await prisma.savedArticle.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
    include: { article: { include: { categories: { select: { slug: true, name: true } } } } },
  });
  res.json({ articles: saved.map((s) => s.article) });
});

// ── POST /api/news/:slug/save ─────────────────────────────────────────
export const saveArticle = asyncHandler(async (req: Request, res: Response) => {
  const article = await prisma.newsArticle.findUnique({ where: { slug: req.params.slug } });
  if (!article) throw ApiError.notFound("Article not found");

  await prisma.savedArticle.upsert({
    where: { userId_articleId: { userId: req.user!.sub, articleId: article.id } },
    update: {},
    create: { userId: req.user!.sub, articleId: article.id },
  });

  res.status(201).json({ message: "Saved." });
});

// ── DELETE /api/news/:slug/save ───────────────────────────────────────
export const unsaveArticle = asyncHandler(async (req: Request, res: Response) => {
  const article = await prisma.newsArticle.findUnique({ where: { slug: req.params.slug } });
  if (!article) throw ApiError.notFound("Article not found");

  await prisma.savedArticle.deleteMany({ where: { userId: req.user!.sub, articleId: article.id } });
  res.json({ message: "Removed." });
});
