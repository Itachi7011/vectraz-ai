import type { Request, Response } from "express";
import axios from "axios";
import Parser from "rss-parser";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

const rssParser = new Parser({ timeout: 10_000 });

// Simple in-memory TTL cache — keeps us well under iTunes' informal
// ~20 requests/minute limit and makes repeat visits instant. Fine for a
// single-process deployment; if you scale to multiple instances later,
// swap this for a shared cache (Redis) — the function signatures won't
// need to change.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const searchCache = new Map<string, { data: unknown; expiresAt: number }>();
const episodeCache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(cache: Map<string, { data: T; expiresAt: number }>, key: string): T | null {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;
  return null;
}
function setCached<T>(cache: Map<string, { data: T; expiresAt: number }>, key: string, data: T) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

const DEFAULT_QUERIES = ["artificial intelligence", "machine learning", "AI podcast", "tech chips semiconductors"];

// ── GET /api/podcasts?q=optional ──────────────────────────────────────
export const searchPodcasts = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim();
  const cacheKey = q ?? "__default__";

  const cached = getCached(searchCache, cacheKey);
  if (cached) return res.json({ shows: cached, cached: true });

  const queries = q ? [q] : DEFAULT_QUERIES;
  const seen = new Set<number>();
  const shows: any[] = [];

  for (const query of queries) {
    try {
      const { data } = await axios.get("https://itunes.apple.com/search", {
        params: { term: query, media: "podcast", entity: "podcast", limit: 25, country: "US" },
        timeout: 8_000,
      });
      for (const r of data.results ?? []) {
        if (!r.feedUrl || seen.has(r.collectionId)) continue;
        seen.add(r.collectionId);
        shows.push({
          id: r.collectionId,
          title: r.collectionName,
          artist: r.artistName,
          artworkUrl: r.artworkUrl600 ?? r.artworkUrl100,
          feedUrl: r.feedUrl,
          genre: r.primaryGenreName,
          episodeCount: r.trackCount,
        });
      }
    } catch (err) {
      console.warn("iTunes search failed for query", query, err instanceof Error ? err.message : err);
    }
  }

  setCached(searchCache, cacheKey, shows);
  res.json({ shows, cached: false });
});

// ── GET /api/podcasts/episodes?feedUrl=... ────────────────────────────
export const getPodcastEpisodes = asyncHandler(async (req: Request, res: Response) => {
  const feedUrl = req.query.feedUrl as string | undefined;
  if (!feedUrl) throw ApiError.badRequest("feedUrl query param is required");

  const cached = getCached(episodeCache, feedUrl);
  if (cached) return res.json({ episodes: cached, cached: true });

  try {
    const feed = await rssParser.parseURL(feedUrl);
    const episodes = (feed.items ?? []).slice(0, 30).map((item) => ({
      title: item.title,
      description: item.contentSnippet?.slice(0, 300),
      audioUrl: item.enclosure?.url,
      duration: (item as any).itunes?.duration ?? null,
      publishedAt: item.isoDate ?? item.pubDate,
      imageUrl: (item as any).itunes?.image ?? feed.image?.url,
    }));

    setCached(episodeCache, feedUrl, episodes);
    res.json({ episodes, cached: false });
  } catch (err) {
    throw ApiError.badRequest("Couldn't load episodes for this show's feed.");
  }
});
