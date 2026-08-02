import axios from "axios";
import { env } from "../../../config/env";
import type { SourceFetchResult, RawArticle } from "../types";

export async function fetchCurrents(): Promise<SourceFetchResult> {
  if (!env.CURRENTS_API_KEY) {
    return { sourceType: "CURRENTS", articles: [], success: true };
  }

  try {
    const { data } = await axios.get("https://api.currentsapi.services/v1/search", {
      params: {
        keywords: "artificial intelligence OR GPU OR semiconductor OR AI chip",
        language: "en",
        apiKey: env.CURRENTS_API_KEY,
      },
      timeout: 10_000,
    });

    const articles: RawArticle[] = (data.news ?? [])
      .filter((a: any) => a.title && a.url)
      .map((a: any) => ({
        title: a.title,
        summary: a.description ?? a.title,
        url: a.url,
        imageUrl: a.image && a.image !== "None" ? a.image : undefined,
        author: a.author ?? undefined,
        sourceName: new URL(a.url).hostname.replace(/^www\./, ""),
        sourceType: "CURRENTS" as const,
        publishedAt: a.published ? new Date(a.published) : new Date(),
      }));

    return { sourceType: "CURRENTS", articles, success: true };
  } catch (err: any) {
    return {
      sourceType: "CURRENTS",
      articles: [],
      success: false,
      errorMessage: err?.response?.data?.message ?? err?.message ?? "Unknown error",
    };
  }
}
