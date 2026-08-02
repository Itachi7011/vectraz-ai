import type { RawArticle } from "./types";

/** Normalizes a URL for comparison: strips query params/fragments/trailing slash, lowercases host+path. */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.toLowerCase()}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * Removes duplicate articles within a single aggregation batch (same URL
 * fetched via two different queries/sources). Cross-run deduplication
 * against already-stored articles happens separately in aggregate.ts via
 * the externalId unique constraint at the database level.
 */
export function dedupeArticles(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>();
  const result: RawArticle[] = [];

  for (const article of articles) {
    const key = normalizeUrl(article.url);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(article);
  }

  return result;
}

export { normalizeUrl };
