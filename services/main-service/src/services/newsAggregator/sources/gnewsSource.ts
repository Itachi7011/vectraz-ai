import axios from "axios";
import { env } from "../../../config/env";
import type { SourceFetchResult, RawArticle } from "../types";

export async function fetchGNews(): Promise<SourceFetchResult> {
  if (!env.GNEWS_API_KEY) {
    return { sourceType: "GNEWS", articles: [], success: true };
  }

  try {
    const { data } = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: "artificial intelligence OR GPU OR semiconductor OR AI chip",
        lang: "en",
        max: 25,
        apikey: env.GNEWS_API_KEY,
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
        imageUrl: a.image ?? undefined,
        sourceName: a.source?.name ?? "GNews",
        sourceType: "GNEWS" as const,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
      }));

    return { sourceType: "GNEWS", articles, success: true };
  } catch (err: any) {
    return {
      sourceType: "GNEWS",
      articles: [],
      success: false,
      errorMessage: err?.response?.data?.errors?.[0] ?? err?.message ?? "Unknown error",
    };
  }
}
