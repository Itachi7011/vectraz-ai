import axios from "axios";
import type { SourceFetchResult, RawArticle } from "../types";

// GDELT's DOC 2.0 API needs no authentication at all. We run a handful of
// targeted queries (AI, GPUs, chips) since a single broad query returns a
// less focused mix. Each query is a separate free call — there's no key
// or quota to manage.
const QUERIES = [
  "artificial intelligence",
  "GPU OR semiconductor chip",
  "OpenAI OR Nvidia OR TSMC",
  "large language model",
];

export async function fetchGdelt(): Promise<SourceFetchResult> {
  const articles: RawArticle[] = [];
  let anySuccess = false;
  const errors: string[] = [];

  for (const query of QUERIES) {
    try {
      const { data } = await axios.get("https://api.gdeltproject.org/api/v2/doc/doc", {
        params: {
          query,
          mode: "artlist",
          format: "json",
          maxrecords: 50,
          timespan: "1d",
          sort: "datedesc",
        },
        timeout: 12_000,
      });

      const list = Array.isArray(data?.articles) ? data.articles : [];
      for (const a of list) {
        if (!a.title || !a.url) continue;
        articles.push({
          title: a.title,
          summary: a.title, // GDELT doesn't return a body/description, just metadata
          url: a.url,
          imageUrl: a.socialimage || undefined,
          sourceName: a.domain ?? "GDELT",
          sourceType: "GDELT" as const,
          publishedAt: a.seendate ? parseGdeltDate(a.seendate) : new Date(),
        });
      }
      anySuccess = true;
    } catch (err: any) {
      errors.push(`"${query}": ${err?.message ?? "failed"}`);
    }
  }

  return {
    sourceType: "GDELT",
    articles,
    success: anySuccess,
    errorMessage: errors.length ? errors.join("; ") : undefined,
  };
}

// GDELT dates look like "20260802T143000Z" — convert to a real Date.
function parseGdeltDate(raw: string): Date {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(raw);
  if (!match) return new Date();
  const [, y, mo, d, h, mi, s] = match;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
}
