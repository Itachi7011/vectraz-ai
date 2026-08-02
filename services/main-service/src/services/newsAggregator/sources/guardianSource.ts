import axios from "axios";
import { env } from "../../../config/env";
import type { SourceFetchResult, RawArticle } from "../types";

export async function fetchGuardian(): Promise<SourceFetchResult> {
  if (!env.GUARDIAN_API_KEY) {
    return { sourceType: "GUARDIAN", articles: [], success: true };
  }

  try {
    const { data } = await axios.get("https://content.guardianapis.com/search", {
      params: {
        q: "artificial intelligence OR semiconductor OR GPU OR AI chip",
        "api-key": env.GUARDIAN_API_KEY,
        "show-fields": "trailText,thumbnail,byline",
        "order-by": "newest",
        "page-size": 30,
      },
      timeout: 10_000,
    });

    const articles: RawArticle[] = (data.response?.results ?? [])
      .filter((a: any) => a.webTitle && a.webUrl)
      .map((a: any) => ({
        title: a.webTitle,
        summary: a.fields?.trailText ?? a.webTitle,
        url: a.webUrl,
        imageUrl: a.fields?.thumbnail ?? undefined,
        author: a.fields?.byline ?? undefined,
        sourceName: "The Guardian",
        sourceType: "GUARDIAN" as const,
        publishedAt: a.webPublicationDate ? new Date(a.webPublicationDate) : new Date(),
      }));

    return { sourceType: "GUARDIAN", articles, success: true };
  } catch (err: any) {
    return {
      sourceType: "GUARDIAN",
      articles: [],
      success: false,
      errorMessage: err?.message ?? "Unknown error",
    };
  }
}
