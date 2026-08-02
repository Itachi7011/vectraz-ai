import axios from "axios";
import { env } from "../../../config/env";
import type { SourceFetchResult, RawArticle } from "../types";

export async function fetchNewsData(): Promise<SourceFetchResult> {
  if (!env.NEWSDATA_IO_KEY) {
    return { sourceType: "NEWSDATA", articles: [], success: true };
  }

  try {
    const { data } = await axios.get("https://newsdata.io/api/1/news", {
      params: {
        apikey: env.NEWSDATA_IO_KEY,
        q: "artificial intelligence OR semiconductor OR GPU chip",
        language: "en",
      },
      timeout: 10_000,
    });

    const articles: RawArticle[] = (data.results ?? [])
      .filter((a: any) => a.title && a.link)
      .map((a: any) => ({
        title: a.title,
        summary: a.description ?? a.title,
        content: a.content ?? undefined,
        url: a.link,
        imageUrl: a.image_url ?? undefined,
        author: Array.isArray(a.creator) ? a.creator[0] : undefined,
        sourceName: a.source_id ?? "NewsData",
        sourceType: "NEWSDATA" as const,
        publishedAt: a.pubDate ? new Date(a.pubDate) : new Date(),
      }));

    return { sourceType: "NEWSDATA", articles, success: true };
  } catch (err: any) {
    return {
      sourceType: "NEWSDATA",
      articles: [],
      success: false,
      errorMessage: err?.response?.data?.results?.message ?? err?.message ?? "Unknown error",
    };
  }
}
