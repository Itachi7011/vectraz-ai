import type { Request, Response } from "express";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler";
import { createTtlCache } from "../utils/ttlCache";

const cache = createTtlCache<any[]>();
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours — GitHub's unauthenticated search limit is 10 req/min

const TOPICS = ["artificial-intelligence", "machine-learning", "llm", "gpu-computing"];

// ── GET /api/github-trending ───────────────────────────────────────────
export const getTrendingRepos = asyncHandler(async (_req: Request, res: Response) => {
  const cached = cache.get("trending");
  if (cached) return res.json({ repos: cached, cached: true });

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const seen = new Set<number>();
  const repos: any[] = [];

  for (const topic of TOPICS) {
    try {
      const { data } = await axios.get("https://api.github.com/search/repositories", {
        params: { q: `topic:${topic} created:>${since}`, sort: "stars", order: "desc", per_page: 10 },
        headers: { Accept: "application/vnd.github+json" },
        timeout: 8_000,
      });
      for (const r of data.items ?? []) {
        if (seen.has(r.id)) continue;
        seen.add(r.id);
        repos.push({
          id: r.id,
          name: r.full_name,
          description: r.description,
          url: r.html_url,
          stars: r.stargazers_count,
          language: r.language,
          ownerAvatar: r.owner?.avatar_url,
          topic,
        });
      }
    } catch (err) {
      console.warn("GitHub trending fetch failed for topic", topic, err instanceof Error ? err.message : err);
    }
  }

  repos.sort((a, b) => b.stars - a.stars);
  cache.set("trending", repos, CACHE_TTL_MS);
  res.json({ repos, cached: false });
});
