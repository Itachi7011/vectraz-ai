import axios from "axios";
import type { SourceFetchResult, RawArticle } from "../types";

const SUBREDDITS = [
  "artificial",
  "MachineLearning",
  "OpenAI",
  "LocalLLaMA",
  "hardware",
  "nvidia",
  "Amd",
  "singularity",
  "StableDiffusion",
  "computerscience",
];

export async function fetchReddit(): Promise<SourceFetchResult> {
  const articles: RawArticle[] = [];
  let anySuccess = false;
  const errors: string[] = [];

  for (const sub of SUBREDDITS) {
    try {
      const { data } = await axios.get(`https://www.reddit.com/r/${sub}/hot.json`, {
        params: { limit: 15 },
        headers: { "User-Agent": "VectrazAI-NewsBot/1.0 (contact: admin@vectrazai.dev)" },
        timeout: 10_000,
      });

      const posts = data?.data?.children ?? [];
      for (const p of posts) {
        const d = p.data;
        if (!d?.title || d.stickied) continue;
        articles.push({
          title: d.title,
          summary: d.selftext ? d.selftext.slice(0, 400) : d.title,
          url: d.url?.startsWith("http") ? d.url : `https://reddit.com${d.permalink}`,
          imageUrl: d.thumbnail?.startsWith("http") ? d.thumbnail : undefined,
          author: d.author ?? undefined,
          sourceName: `r/${sub}`,
          sourceType: "REDDIT" as const,
          publishedAt: d.created_utc ? new Date(d.created_utc * 1000) : new Date(),
        });
      }
      anySuccess = true;
    } catch (err: any) {
      errors.push(`${sub}: ${err?.message ?? "failed"}`);
    }
  }

  return {
    sourceType: "REDDIT",
    articles,
    success: anySuccess,
    errorMessage: errors.length ? errors.join("; ") : undefined,
  };
}
