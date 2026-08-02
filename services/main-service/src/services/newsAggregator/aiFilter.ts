import axios from "axios";
import { env, isOpenAiConfigured } from "../../config/env";
import { KEYWORD_GROUPS } from "../../keywords/aiKeywords";
import { keywordFilter, type FilterResult } from "./keywordFilter";

const CATEGORY_SLUGS = Object.keys(KEYWORD_GROUPS);

/**
 * Classifies whether an article is about AI / chips / GPUs / semiconductors
 * and related topics.
 *
 * Flow: if OPENAI_API_KEY is present, ask the model for a relevance +
 * category judgment. If the key is absent, OR the call fails for any
 * reason (network error, rate limit, bad JSON, timeout), this silently
 * falls back to the manual keyword matcher — the caller never sees an
 * error and the pipeline never stalls on a flaky AI provider.
 */
export async function classifyArticle(title: string, summary: string): Promise<FilterResult> {
  if (!isOpenAiConfigured) {
    return keywordFilter(title, summary);
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You classify news headlines/summaries for a site about AI, GPUs, chips, and semiconductors. " +
              `Respond ONLY with compact JSON: {"relevant": boolean, "confidence": number (0-1), "categories": string[]}. ` +
              `"categories" must only contain values from this exact list: ${CATEGORY_SLUGS.join(", ")}.`,
          },
          { role: "user", content: `Title: ${title}\nSummary: ${summary}` },
        ],
        temperature: 0,
        max_tokens: 150,
        response_format: { type: "json_object" },
      },
      {
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        timeout: 8_000,
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(raw);

    const categories = Array.isArray(parsed.categories)
      ? parsed.categories.filter((c: string) => CATEGORY_SLUGS.includes(c))
      : [];

    return {
      isRelevant: Boolean(parsed.relevant),
      matchedKeywords: [],
      categorySlugs: categories,
      confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
      method: "openai",
    };
  } catch (err) {
    console.warn(
      "⚠️  OpenAI classification failed, falling back to keyword filter:",
      err instanceof Error ? err.message : err
    );
    return keywordFilter(title, summary);
  }
}
