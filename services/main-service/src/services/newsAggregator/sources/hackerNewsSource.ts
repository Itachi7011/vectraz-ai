import axios from "axios";
import type { SourceFetchResult, RawArticle } from "../types";

const QUERIES = ["artificial intelligence", "GPU", "semiconductor chip", "LLM", "machine learning"];

export async function fetchHackerNews(): Promise<SourceFetchResult> {
  const articles: RawArticle[] = [];
  let anySuccess = false;
  const errors: string[] = [];

  for (const query of QUERIES) {
    try {
      const { data } = await axios.get("https://hn.algolia.com/api/v1/search_by_date", {
        params: { query, tags: "story", hitsPerPage: 30 },
        timeout: 10_000,
      });

      for (const h of data.hits ?? []) {
        if (!h.title || !(h.url || h.story_text)) continue;
        articles.push({
          title: h.title,
          summary: h.story_text ? h.story_text.slice(0, 400) : h.title,
          url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
          author: h.author ?? undefined,
          sourceName: "Hacker News",
          sourceType: "HACKERNEWS" as const,
          publishedAt: h.created_at ? new Date(h.created_at) : new Date(),
        });
      }
      anySuccess = true;
    } catch (err: any) {
      errors.push(`"${query}": ${err?.message ?? "failed"}`);
    }
  }

  return {
    sourceType: "HACKERNEWS",
    articles,
    success: anySuccess,
    errorMessage: errors.length ? errors.join("; ") : undefined,
  };
}
