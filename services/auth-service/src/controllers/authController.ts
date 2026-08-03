import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { hashPassword, comparePassword } from "../utils/password";
import {
  generateOtpCode,
  hashOtpCode,
  compareOtpCode,
  otpExpiryDate,
  OTP_MAX_ATTEMPTS,
  sha256,
} from "../utils/otp";
import { sendEmail, otpEmailTemplate } from "../utils/emailService";
import { signAccessToken, signRefreshToken, verifyRefreshToken, expiresInToMs } from "../utils/jwt";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies";
import { env } from "../config/env";
import type {
  SignupInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validators/authValidators";

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  emailDigestEnabled: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    emailDigestEnabled: user.emailDigestEnabled,
    createdAt: user.createdAt,
  };
}

async function issueSession(res: Response, user: { id: string; role: "USER" | "ADMIN"; isEmailVerified: boolean }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, emailVerified: user.isEmailVerified });
  const refreshToken = signRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + expiresInToMs(env.JWT_REFRESH_EXPIRES_IN)),
    },
  });

  setAuthCookies(res, accessToken, refreshToken);
  return { accessToken, refreshToken };
}

async function issueAndSendOtp(email: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET", userId?: string) {
  const code = generateOtpCode();
  await prisma.otpCode.create({
    data: {
      email,
      userId,
      purpose,
      codeHash: await hashOtpCode(code),
      expiresAt: otpExpiryDate(),
    },
  });

  const template = otpEmailTemplate(code, purpose === "EMAIL_VERIFICATION" ? "verify your email" : "reset your password");
  await sendEmail({ to: email, ...template });
}

// ── POST /api/auth/signup ────────────────────────────────────────────
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as SignupInput;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing?.isEmailVerified) {
    throw ApiError.conflict("An account with this email already exists. Try logging in instead.");
  }

  let user;
  if (existing) {
    // Re-attempted signup before verifying — update details and resend a code.
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { name, passwordHash: await hashPassword(password) },
    });
  } else {
    user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
  }

  await issueAndSendOtp(email, "EMAIL_VERIFICATION", user.id);

  res.status(201).json({
    message: "Account created. Check your email for a verification code.",
    email,
  });
});

// ── POST /api/auth/verify-otp ────────────────────────────────────────
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, purpose } = req.body as VerifyOtpInput;

  if (purpose === "PASSWORD_RESET") {
    throw ApiError.badRequest("Use /api/auth/reset-password to complete a password reset.");
  }

  const otp = await prisma.otpCode.findFirst({
    where: { email, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) throw ApiError.badRequest("Code is invalid or has expired. Request a new one.");
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    throw ApiError.tooMany("Too many incorrect attempts. Request a new code.");
  }

  const isMatch = await compareOtpCode(code, otp.codeHash);
  if (!isMatch) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw ApiError.badRequest("Incorrect code.");
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  const user = await prisma.user.update({
    where: { email },
    data: { isEmailVerified: true, lastLoginAt: new Date() },
  });

  const tokens = await issueSession(res, { id: user.id, role: user.role, isEmailVerified: true });

  res.json({
    message: "Email verified.",
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
  });
});

// ── POST /api/auth/resend-otp ────────────────────────────────────────
export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, purpose } = req.body as ResendOtpInput;

  if (purpose === "LOGIN_2FA") {
    throw ApiError.badRequest("2FA is not enabled for this account flow yet.");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Don't reveal whether the account exists.
  if (!user) {
    return res.json({ message: "If an account exists for this email, a new code has been sent." });
  }

  if (purpose === "EMAIL_VERIFICATION" && user.isEmailVerified) {
    throw ApiError.badRequest("This email is already verified.");
  }

  await issueAndSendOtp(email, purpose, user.id);
  res.json({ message: "If an account exists for this email, a new code has been sent." });
});

// ── POST /api/auth/login ─────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized("Invalid email or password.");

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password.");

  if (user.isBlocked) {
    throw ApiError.forbidden(user.blockedReason ?? "This account has been blocked. Contact support.");
  }

  if (!user.isEmailVerified) {
    await issueAndSendOtp(email, "EMAIL_VERIFICATION", user.id);
    throw new ApiError(403, "Please verify your email to continue. A new code has been sent.", {
      requiresVerification: true,
    });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const tokens = await issueSession(res, { id: user.id, role: user.role, isEmailVerified: true });

  res.json({
    message: "Logged in successfully.",
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
  });
});

// ── POST /api/auth/refresh ───────────────────────────────────────────
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.refreshToken as string | undefined;
  if (!rawToken) throw ApiError.unauthorized("No active session.");

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    clearAuthCookies(res);
    throw ApiError.unauthorized("Session expired. Please log in again.");
  }

  const tokenHash = sha256(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
    clearAuthCookies(res);
    throw ApiError.unauthorized("Session is no longer valid. Please log in again.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.isBlocked) {
    clearAuthCookies(res);
    throw ApiError.unauthorized("Session is no longer valid. Please log in again.");
  }

  // Rotate: revoke the used refresh token, issue a brand new pair.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const tokens = await issueSession(res, { id: user.id, role: user.role, isEmailVerified: user.isEmailVerified });

  res.json({ accessToken: tokens.accessToken });
});

// ── POST /api/auth/logout ────────────────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.refreshToken as string | undefined;
  if (rawToken) {
    const tokenHash = sha256(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  clearAuthCookies(res);
  res.json({ message: "Logged out." });
});

// ── POST /api/auth/forgot-password ───────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await issueAndSendOtp(email, "PASSWORD_RESET", user.id);
  }

  // Same response whether or not the account exists — avoids user enumeration.
  res.json({ message: "If an account exists for this email, a reset code has been sent." });
});

// ── POST /api/auth/reset-password ────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body as ResetPasswordInput;

  const otp = await prisma.otpCode.findFirst({
    where: { email, purpose: "PASSWORD_RESET", consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) throw ApiError.badRequest("Code is invalid or has expired. Request a new one.");
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    throw ApiError.tooMany("Too many incorrect attempts. Request a new code.");
  }

  const isMatch = await compareOtpCode(code, otp.codeHash);
  if (!isMatch) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw ApiError.badRequest("Incorrect code.");
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  // Invalidate all existing sessions on password change.
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: { action: "PASSWORD_RESET", performedById: user.id, targetType: "User", targetId: user.id },
  });

  res.json({ message: "Password has been reset. Please log in with your new password." });
});

// ── GET /api/auth/health ─────────────────────────────────────────────
export const health = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ service: "auth-service", status: "ok", time: new Date().toISOString() });
});
