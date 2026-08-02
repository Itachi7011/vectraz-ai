import axios from "axios";
import { env } from "../../../config/env";
import { SEARCH_QUERY_TERMS } from "../../../keywords/aiKeywords";
import type { SourceFetchResult, RawArticle } from "../types";

export async function fetchNewsApi(): Promise<SourceFetchResult> {
  if (!env.NEWSAPI_ORG_KEY) {
    return { sourceType: "NEWSAPI", articles: [], success: true };
  }

  try {
    const { data } = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: SEARCH_QUERY_TERMS,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 40,
        apiKey: env.NEWSAPI_ORG_KEY,
      },
      timeout: 10_000,
    });

    const articles: RawArticle[] = (data.articles ?? [])
      .filter((a: any) => a.title && a.url)
      .map((a: any) => ({
        title: a.title,
        summary: a.description ?? a.title,
        content: a.content ?? undefined,
        url: a.url,
        imageUrl: a.urlToImage ?? undefined,
        author: a.author ?? undefined,
        sourceName: a.source?.name ?? "NewsAPI",
        sourceType: "NEWSAPI" as const,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
      }));

    return { sourceType: "NEWSAPI", articles, success: true };
  } catch (err: any) {
    return {
      sourceType: "NEWSAPI",
      articles: [],
      success: false,
      errorMessage: err?.response?.data?.message ?? err?.message ?? "Unknown error",
    };
  }
}
