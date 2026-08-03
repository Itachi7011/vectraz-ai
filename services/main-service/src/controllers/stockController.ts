import type { Request, Response } from "express";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler";
import { createTtlCache } from "../utils/ttlCache";
import { env, isFinnhubConfigured } from "../config/env";

const cache = createTtlCache<any[]>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min — Finnhub allows 60/min so this is generous headroom

const TICKERS = [
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "AMD", name: "AMD" },
  { symbol: "INTC", name: "Intel" },
  { symbol: "TSM", name: "TSMC" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "META", name: "Meta" },
  { symbol: "AVGO", name: "Broadcom" },
];

// ── GET /api/stocks ────────────────────────────────────────────────────
export const getStockTicker = asyncHandler(async (_req: Request, res: Response) => {
  if (!isFinnhubConfigured) {
    return res.json({ quotes: [], configured: false });
  }

  const cached = cache.get("quotes");
  if (cached) return res.json({ quotes: cached, configured: true, cached: true });

  const quotes: any[] = [];
  for (const t of TICKERS) {
    try {
      const { data } = await axios.get("https://finnhub.io/api/v1/quote", {
        params: { symbol: t.symbol, token: env.FINNHUB_API_KEY },
        timeout: 6_000,
      });
      if (typeof data.c === "number" && data.c > 0) {
        quotes.push({
          symbol: t.symbol,
          name: t.name,
          price: data.c,
          change: data.d,
          changePercent: data.dp,
        });
      }
    } catch (err) {
      console.warn("Finnhub quote failed for", t.symbol, err instanceof Error ? err.message : err);
    }
  }

  cache.set("quotes", quotes, CACHE_TTL_MS);
  res.json({ quotes, configured: true, cached: false });
});
