import { z } from "zod";

export const upgradeSubscriptionSchema = z.object({
  body: z.object({
    plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
  }),
});
