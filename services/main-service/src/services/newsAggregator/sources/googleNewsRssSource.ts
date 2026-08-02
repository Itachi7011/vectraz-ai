import Parser from "rss-parser";
import type { SourceFetchResult, RawArticle } from "../types";

const parser = new Parser({ timeout: 10_000 });

// Google News exposes a public RSS search feed with no authentication:
//   https://news.google.com/rss/search?q=QUERY&hl=en-US&gl=US&ceid=US:en
// This is unofficial (no formal API contract) but widely relied upon —
// treat it as a bonus volume source, not a primary dependency.
const QUERIES = [
  "artificial intelligence",
  "GPU chips semiconductor",
  "Nvidia OR TSMC OR AMD",
  "machine learning model",
  "AI regulation policy",
];

export async function fetchGoogleNewsRss(): Promise<SourceFetchResult> {
  const articles: RawArticle[] = [];
  let anySuccess = false;
  const errors: string[] = [];

  for (const query of QUERIES) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      const feed = await parser.parseURL(url);

      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        articles.push({
          title: item.title,
          summary: item.contentSnippet ?? item.title,
          url: item.link,
          sourceName: extractSource(item.title) ?? "Google News",
          sourceType: "GOOGLE_NEWS" as const,
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        });
      }
      anySuccess = true;
    } catch (err: any) {
      errors.push(`"${query}": ${err?.message ?? "failed"}`);
    }
  }

  return {
    sourceType: "GOOGLE_NEWS",
    articles,
    success: anySuccess,
    errorMessage: errors.length ? errors.join("; ") : undefined,
  };
}

// Google News titles are formatted "Headline - Publisher Name" — pull the
// publisher out so sourceName is more useful than a generic "Google News".
function extractSource(title: string): string | undefined {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts[parts.length - 1].trim() : undefined;
}
