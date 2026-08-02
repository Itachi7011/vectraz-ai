import { z } from "zod";

export const blockUserSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(3).max(300),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    blocked: z.enum(["true", "false"]).optional(),
  }),
});

// Powers the "today / this week / this month / this year / custom" range
// picker on the admin analytics dashboard.
export const analyticsRangeSchema = z.object({
  query: z.object({
    range: z.enum(["today", "week", "month", "year", "custom"]).default("week"),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export const listArticlesAdminSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  }),
});
