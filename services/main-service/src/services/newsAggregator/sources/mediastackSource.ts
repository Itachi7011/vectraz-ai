import axios from "axios";
import { env } from "../../../config/env";
import type { SourceFetchResult, RawArticle } from "../types";

export async function fetchMediastack(): Promise<SourceFetchResult> {
  if (!env.MEDIASTACK_API_KEY) {
    return { sourceType: "MEDIASTACK", articles: [], success: true };
  }

  try {
    const { data } = await axios.get("http://api.mediastack.com/v1/news", {
      params: {
        access_key: env.MEDIASTACK_API_KEY,
        keywords: "artificial intelligence,semiconductor,GPU,AI chip",
        languages: "en",
        limit: 40,
      },
      timeout: 10_000,
    });

    const articles: RawArticle[] = (data.data ?? [])
      .filter((a: any) => a.title && a.url)
      .map((a: any) => ({
        title: a.title,
        summary: a.description ?? a.title,
        url: a.url,
        imageUrl: a.image ?? undefined,
        author: a.author ?? undefined,
        sourceName: a.source ?? "Mediastack",
        sourceType: "MEDIASTACK" as const,
        publishedAt: a.published_at ? new Date(a.published_at) : new Date(),
      }));

    return { sourceType: "MEDIASTACK", articles, success: true };
  } catch (err: any) {
    return {
      sourceType: "MEDIASTACK",
      articles: [],
      success: false,
      errorMessage: err?.response?.data?.error?.message ?? err?.message ?? "Unknown error",
    };
  }
}
