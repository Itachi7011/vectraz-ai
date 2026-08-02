import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  AUTH_SERVICE_PORT: z.coerce.number().default(5003),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be set to a long random string"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be set to a long random string"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // Optional — features degrade gracefully (console fallback) when unset.
  SENDGRID_API_KEY: z.string().optional().default(""),
  SENDGRID_FROM_EMAIL: z.string().default("no-reply@vectrazai.dev"),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid auth-service environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isSendGridConfigured = env.SENDGRID_API_KEY.trim().length > 0;
export const isCloudinaryConfigured =
  env.CLOUDINARY_CLOUD_NAME.trim().length > 0 &&
  env.CLOUDINARY_API_KEY.trim().length > 0 &&
  env.CLOUDINARY_API_SECRET.trim().length > 0;
