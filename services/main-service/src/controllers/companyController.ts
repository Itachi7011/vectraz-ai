import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { COMPANIES, findCompany } from "../keywords/companies";

// ── GET /api/companies ───────────────────────────────────────────────
export const listCompanies = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    companies: COMPANIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      logoUrl: `https://logo.clearbit.com/${c.domain}`,
    })),
  });
});

// ── GET /api/companies/:slug ──────────────────────────────────────────
export const getCompanyArticles = asyncHandler(async (req: Request, res: Response) => {
  const company = findCompany(req.params.slug);
  if (!company) throw ApiError.notFound("Company not tracked");

  const page = Number(req.query.page ?? 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 50);

  const where = {
    status: "APPROVED" as const,
    OR: [
      ...company.aliases.map((a) => ({ title: { contains: a, mode: "insensitive" as const } })),
      ...company.aliases.map((a) => ({ summary: { contains: a, mode: "insensitive" as const } })),
      { matchedKeywords: { hasSome: company.aliases } },
    ],
  };

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { categories: { select: { slug: true, name: true } } },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  res.json({
    company: { slug: company.slug, name: company.name, logoUrl: `https://logo.clearbit.com/${company.domain}` },
    articles,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
