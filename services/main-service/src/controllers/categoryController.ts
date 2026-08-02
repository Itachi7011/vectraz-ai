import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

// ── GET /api/categories ──────────────────────────────────────────────
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  res.json({ categories });
});

// ── GET /api/categories/:slug ────────────────────────────────────────
export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({ where: { slug: req.params.slug } });
  if (!category) throw ApiError.notFound("Category not found");
  res.json({ category });
});

// ── POST /api/categories/:slug/click ─────────────────────────────────
// Called by the frontend when a user selects a category filter, purely
// to track category popularity for the admin analytics dashboard.
export const trackCategoryClick = asyncHandler(async (req: Request, res: Response) => {
  const category = await prisma.category.update({
    where: { slug: req.params.slug },
    data: { clickCount: { increment: 1 } },
  });
  res.json({ clickCount: category.clickCount });
});
