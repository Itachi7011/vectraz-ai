import Parser from "rss-parser";
import type { SourceFetchResult, RawArticle } from "../types";

const parser = new Parser({ timeout: 10_000 });

// Bing also exposes a public, keyless RSS search feed:
//   https://www.bing.com/news/search?q=QUERY&format=RSS
const QUERIES = ["artificial intelligence chips", "GPU semiconductor news", "AI startup funding"];

export async function fetchBingNewsRss(): Promise<SourceFetchResult> {
  const articles: RawArticle[] = [];
  let anySuccess = false;
  const errors: string[] = [];

  for (const query of QUERIES) {
    try {
      const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=RSS`;
      const feed = await parser.parseURL(url);

      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        articles.push({
          title: item.title,
          summary: item.contentSnippet ?? item.title,
          url: item.link,
          sourceName: (item as any).source ?? "Bing News",
          sourceType: "BING_NEWS" as const,
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        });
      }
      anySuccess = true;
    } catch (err: any) {
      errors.push(`"${query}": ${err?.message ?? "failed"}`);
    }
  }

  return {
    sourceType: "BING_NEWS",
    articles,
    success: anySuccess,
    errorMessage: errors.length ? errors.join("; ") : undefined,
  };
}
