import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MAIN_SERVICE_PORT: z.coerce.number().default(5002),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be set (must match auth-service)"),

  // All optional — every source with no key configured is simply skipped
  // by the aggregator. The free/no-key sources (Hacker News, arXiv,
  // Reddit public JSON, RSS) always run regardless.
  NEWSAPI_ORG_KEY: z.string().optional().default(""),
  GNEWS_API_KEY: z.string().optional().default(""),
  NEWSDATA_IO_KEY: z.string().optional().default(""),
  MEDIASTACK_API_KEY: z.string().optional().default(""),
  GUARDIAN_API_KEY: z.string().optional().default(""),

  // Free tier, no credit card, explicitly permits commercial use — the
  // best "safe" keyed free source. https://currentsapi.services
  CURRENTS_API_KEY: z.string().optional().default(""),

  // Free tier: 60 calls/min, no credit card. https://finnhub.io
  FINNHUB_API_KEY: z.string().optional().default(""),

  // Weekly digest email (main-service sends its own, independent of auth-service)
  SENDGRID_API_KEY: z.string().optional().default(""),
  SENDGRID_FROM_EMAIL: z.string().default("no-reply@vectrazai.dev"),
  DIGEST_CRON: z.string().default("0 9 * * 1"), // 9am every Monday

  OPENAI_API_KEY: z.string().optional().default(""),

  NEWS_FETCH_CRON: z.string().default("*/30 * * * *"), // every 30 min by default
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid main-service environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isOpenAiConfigured = env.OPENAI_API_KEY.trim().length > 0;
export const isFinnhubConfigured = env.FINNHUB_API_KEY.trim().length > 0;
export const isSendGridConfigured = env.SENDGRID_API_KEY.trim().length > 0;
