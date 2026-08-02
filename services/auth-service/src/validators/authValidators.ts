import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long") // bcrypt's practical input limit
  .refine((v) => /[A-Za-z]/.test(v), "Password must contain a letter")
  .refine((v) => /[0-9]/.test(v), "Password must contain a number")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Password must contain a special character");

export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name is too short").max(80),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    code: z.string().length(6, "Code must be 6 digits"),
    purpose: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "LOGIN_2FA"]),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    purpose: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "LOGIN_2FA"]),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    code: z.string().length(6),
    newPassword: passwordSchema,
  }),
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>["body"];
export type ResendOtpInput = z.infer<typeof resendOtpSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
