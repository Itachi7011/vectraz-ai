import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

// ── POST /api/news/:slug/report ──────────────────────────────────────
export const reportArticle = asyncHandler(async (req: Request, res: Response) => {
  const { reason, details } = req.body as { reason: string; details?: string };
  const article = await prisma.newsArticle.findUnique({ where: { slug: req.params.slug } });
  if (!article) throw ApiError.notFound("Article not found");

  const report = await prisma.articleReport.create({
    data: {
      articleId: article.id,
      userId: req.user!.sub,
      reason: reason as any,
      details,
    },
  });

  res.status(201).json({ message: "Thanks — our team will review this article.", report });
});
