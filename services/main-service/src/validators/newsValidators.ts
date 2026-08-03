import { z } from "zod";

export const listNewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    category: z.string().optional(),
    sort: z.enum(["latest", "trending", "most-viewed"]).default("latest"),
    q: z.string().trim().max(200).optional(),
    sourceType: z
      .enum([
        "NEWSAPI",
        "GNEWS",
        "NEWSDATA",
        "MEDIASTACK",
        "GUARDIAN",
        "HACKERNEWS",
        "ARXIV",
        "REDDIT",
        "RSS",
        "CURRENTS",
        "GDELT",
        "GOOGLE_NEWS",
        "BING_NEWS",
      ])
      .optional(),
  }),
});

export const trendingSchema = z.object({
  query: z.object({
    window: z.enum(["24h", "7d", "30d"]).default("24h"),
    limit: z.coerce.number().int().min(1).max(20).default(10),
  }),
});

export const reportArticleSchema = z.object({
  body: z.object({
    reason: z.enum(["INACCURATE", "SPAM", "OFFENSIVE", "DUPLICATE", "OTHER"]),
    details: z.string().trim().max(500).optional(),
  }),
});
