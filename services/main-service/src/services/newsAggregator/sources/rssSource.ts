import Parser from "rss-parser";
import type { SourceFetchResult, RawArticle } from "../types";

const parser = new Parser({ timeout: 10_000 });

// Curated list of publicly available RSS feeds that regularly cover
// AI/chips/GPUs. Feel free to add/remove URLs — the aggregator treats
// every item the same way regardless of which feed it came from.
const FEEDS: { url: string; name: string }[] = [
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", name: "TechCrunch AI" },
  { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", name: "The Verge AI" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", name: "Ars Technica" },
  { url: "https://venturebeat.com/category/ai/feed/", name: "VentureBeat AI" },
  { url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", name: "MIT Technology Review" },
  { url: "https://www.wired.com/feed/tag/ai/latest/rss", name: "Wired AI" },
  { url: "https://www.engadget.com/rss.xml", name: "Engadget" },
  { url: "https://www.zdnet.com/topic/artificial-intelligence/rss.xml", name: "ZDNet AI" },
  { url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss", name: "IEEE Spectrum AI" },
  { url: "https://spectrum.ieee.org/feeds/topic/semiconductors.rss", name: "IEEE Spectrum Semiconductors" },
  { url: "https://semiengineering.com/feed/", name: "Semiconductor Engineering" },
  { url: "https://www.datacenterdynamics.com/en/rss/", name: "Data Center Dynamics" },
  { url: "https://www.tomshardware.com/feeds/all", name: "Tom's Hardware" },
  { url: "https://www.theregister.com/software/ai_ml/headlines.atom", name: "The Register AI" },
  { url: "https://www.techradar.com/feeds/tag/artificial-intelligence", name: "TechRadar AI" },
  { url: "https://siliconangle.com/feed/", name: "SiliconANGLE" },
  { url: "https://openai.com/blog/rss.xml", name: "OpenAI Blog" },
  { url: "https://blogs.nvidia.com/feed/", name: "NVIDIA Blog" },
  { url: "https://ai.googleblog.com/feeds/posts/default", name: "Google AI Blog" },
  { url: "https://www.microsoft.com/en-us/research/feed/", name: "Microsoft Research" },
  { url: "https://huggingface.co/blog/feed.xml", name: "Hugging Face Blog" },
];

export async function fetchRss(): Promise<SourceFetchResult> {
  const articles: RawArticle[] = [];
  let anySuccess = false;
  const errors: string[] = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items ?? []) {
        if (!item.title || !item.link) continue;
        articles.push({
          title: item.title,
          summary: item.contentSnippet ?? item.title,
          content: item.content ?? undefined,
          url: item.link,
          imageUrl: extractImage(item),
          author: item.creator ?? item.author ?? undefined,
          sourceName: feed.name,
          sourceType: "RSS" as const,
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        });
      }
      anySuccess = true;
    } catch (err: any) {
      errors.push(`${feed.name}: ${err?.message ?? "failed"}`);
    }
  }

  return {
    sourceType: "RSS",
    articles,
    success: anySuccess,
    errorMessage: errors.length ? errors.join("; ") : undefined,
  };
}

function extractImage(item: any): string | undefined {
  if (item.enclosure?.url) return item.enclosure.url;
  const match = /<img[^>]+src="([^">]+)"/i.exec(item.content ?? item["content:encoded"] ?? "");
  return match?.[1];
}
