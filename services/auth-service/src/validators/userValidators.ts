import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .max(72)
      .refine((v) => /[A-Za-z]/.test(v), "Password must contain a letter")
      .refine((v) => /[0-9]/.test(v), "Password must contain a number")
      .refine((v) => /[^A-Za-z0-9]/.test(v), "Password must contain a special character"),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
