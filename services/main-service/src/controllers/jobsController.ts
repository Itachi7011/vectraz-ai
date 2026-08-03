import type { Request, Response } from "express";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler";
import { createTtlCache } from "../utils/ttlCache";

const cache = createTtlCache<any[]>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// ── GET /api/jobs?q=optional ────────────────────────────────────────
export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim() || "AI";
  const cacheKey = q.toLowerCase();

  const cached = cache.get(cacheKey);
  if (cached) return res.json({ jobs: cached, cached: true });

  try {
    const { data } = await axios.get("https://remotive.com/api/remote-jobs", {
      params: { search: q, limit: 40 },
      timeout: 10_000,
    });

    const jobs = (data.jobs ?? []).map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company_name,
      companyLogo: j.company_logo_url,
      location: j.candidate_required_location,
      type: j.job_type,
      url: j.url,
      publishedAt: j.publication_date,
      tags: j.tags,
    }));

    cache.set(cacheKey, jobs, CACHE_TTL_MS);
    res.json({ jobs, cached: false });
  } catch (err) {
    console.warn("Remotive fetch failed:", err instanceof Error ? err.message : err);
    res.json({ jobs: [], cached: false });
  }
});
