import { prisma } from "@vectrazai/db";
import { slugify, externalIdFor } from "../../utils/slugify";
import { classifyArticle } from "./aiFilter";
import { classifySentiment } from "../../keywords/sentiment";
import { dedupeArticles } from "./dedupe";
import { fetchNewsApi } from "./sources/newsApiSource";
import { fetchGNews } from "./sources/gnewsSource";
import { fetchNewsData } from "./sources/newsDataSource";
import { fetchMediastack } from "./sources/mediastackSource";
import { fetchGuardian } from "./sources/guardianSource";
import { fetchHackerNews } from "./sources/hackerNewsSource";
import { fetchArxiv } from "./sources/arxivSource";
import { fetchReddit } from "./sources/redditSource";
import { fetchRss } from "./sources/rssSource";
import { fetchGdelt } from "./sources/gdeltSource";
import { fetchGoogleNewsRss } from "./sources/googleNewsRssSource";
import { fetchBingNewsRss } from "./sources/bingNewsRssSource";
import { fetchCurrents } from "./sources/currentsSource";
import type { SourceFetchResult } from "./types";

const SOURCE_FETCHERS = [
  fetchNewsApi,
  fetchGNews,
  fetchNewsData,
  fetchMediastack,
  fetchGuardian,
  fetchHackerNews,
  fetchArxiv,
  fetchReddit,
  fetchRss,
  fetchGdelt,
  fetchGoogleNewsRss,
  fetchBingNewsRss,
  fetchCurrents,
];

export type AggregationSummary = {
  totalFetched: number;
  totalRelevant: number;
  totalStored: number;
  sourceResults: { sourceType: string; success: boolean; fetched: number; errorMessage?: string }[];
};

let isRunning = false;

export async function runAggregation(): Promise<AggregationSummary> {
  if (isRunning) {
    console.log("⏭️  Aggregation already in progress, skipping this run.");
    return { totalFetched: 0, totalRelevant: 0, totalStored: 0, sourceResults: [] };
  }
  isRunning = true;

  try {
    console.log("🔄 Starting news aggregation run...");

    const settled = await Promise.allSettled(SOURCE_FETCHERS.map((fn) => fn()));
    const results: SourceFetchResult[] = settled.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : {
            sourceType: SOURCE_FETCHERS[i].name as any,
            articles: [],
            success: false,
            errorMessage: (r.reason as Error)?.message ?? "Unknown error",
          }
    );

    // Log per-source health for the admin dashboard.
    await prisma.newsSourceLog.createMany({
      data: results.map((r) => ({
        sourceType: r.sourceType,
        success: r.success,
        articlesFetched: r.articles.length,
        errorMessage: r.errorMessage,
      })),
    });

    const allArticles = dedupeArticles(results.flatMap((r) => r.articles));
    console.log(`📥 Fetched ${allArticles.length} unique articles across ${results.length} sources.`);

    // Preload categories once so we're not round-tripping the DB per article.
    const categories = await prisma.category.findMany();
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

    let storedCount = 0;
    let relevantCount = 0;

    for (const article of allArticles) {
      const classification = await classifyArticle(article.title, article.summary);
      if (!classification.isRelevant) continue;
      relevantCount++;

      const externalId = externalIdFor(article.sourceType, article.url);
      const sentiment = classifySentiment(article.title, article.summary);
      const categoryIds = classification.categorySlugs
        .map((slug) => categoryBySlug.get(slug)?.id)
        .filter((id): id is string => Boolean(id));

      try {
        await prisma.newsArticle.upsert({
          where: { externalId },
          update: {
            // Keep view/click counters intact on re-fetch; only refresh content fields.
            title: article.title,
            summary: article.summary,
            content: article.content,
            imageUrl: article.imageUrl,
            matchedKeywords: classification.matchedKeywords,
            aiFilterConfidence: classification.confidence,
            sentiment,
          },
          create: {
            externalId,
            slug: slugify(article.title),
            title: article.title,
            summary: article.summary,
            content: article.content,
            url: article.url,
            imageUrl: article.imageUrl,
            author: article.author,
            sourceName: article.sourceName,
            sourceType: article.sourceType,
            matchedKeywords: classification.matchedKeywords,
            aiFilterConfidence: classification.confidence,
            sentiment,
            publishedAt: article.publishedAt,
            status: "APPROVED",
            categories: { connect: categoryIds.map((id) => ({ id })) },
          },
        });
        storedCount++;
      } catch (err) {
        console.warn(`⚠️  Failed to upsert article "${article.title}":`, err instanceof Error ? err.message : err);
      }
    }

    console.log(`✅ Aggregation complete: ${relevantCount} relevant, ${storedCount} stored/updated.`);

    return {
      totalFetched: allArticles.length,
      totalRelevant: relevantCount,
      totalStored: storedCount,
      sourceResults: results.map((r) => ({
        sourceType: r.sourceType,
        success: r.success,
        fetched: r.articles.length,
        errorMessage: r.errorMessage,
      })),
    };
  } finally {
    isRunning = false;
  }
}
