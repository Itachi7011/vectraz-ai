import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";

export const updatePreferencesSchema = z.object({
  body: z.object({
    categorySlugs: z.array(z.string()).max(20),
  }),
});

// ── GET /api/preferences ─────────────────────────────────────────────
export const getPreferences = asyncHandler(async (req: Request, res: Response) => {
  const preferences = await prisma.userCategoryPreference.findMany({
    where: { userId: req.user!.sub },
    include: { category: true },
  });
  res.json({ categories: preferences.map((p) => p.category) });
});

// ── PUT /api/preferences ─────────────────────────────────────────────
// Replaces the full set of preferred categories in one call (simpler for
// a checkbox-list UI than incremental add/remove endpoints).
export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  const { categorySlugs } = req.body as { categorySlugs: string[] };
  const userId = req.user!.sub;

  const categories = await prisma.category.findMany({ where: { slug: { in: categorySlugs } } });

  await prisma.$transaction([
    prisma.userCategoryPreference.deleteMany({ where: { userId } }),
    prisma.userCategoryPreference.createMany({
      data: categories.map((c) => ({ userId, categoryId: c.id })),
    }),
  ]);

  res.json({ categories });
});
