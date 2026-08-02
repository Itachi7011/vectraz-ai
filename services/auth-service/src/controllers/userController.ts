import type { Request, Response } from "express";
import { prisma } from "@vectrazai/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { comparePassword, hashPassword } from "../utils/password";
import { isCloudinaryConfigured } from "../config/env";
import cloudinary from "../config/cloudinary";
import type { UpdateProfileInput, ChangePasswordInput } from "../validators/userValidators";

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

// ── GET /api/auth/me ──────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) throw ApiError.notFound("User not found");
  res.json({ user: sanitizeUser(user) });
});

// ── PATCH /api/auth/me ────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as UpdateProfileInput;
  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: { ...(name ? { name } : {}) },
  });
  res.json({ user: sanitizeUser(user) });
});

// ── POST /api/auth/me/change-password ────────────────────────────────
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) throw ApiError.notFound("User not found");

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) throw ApiError.badRequest("Current password is incorrect.");

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  // Changing your password invalidates other sessions for safety.
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  res.json({ message: "Password updated. Please log in again on other devices." });
});

// ── POST /api/auth/me/avatar ──────────────────────────────────────────
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, "Avatar uploads are temporarily unavailable. Please try again later.");
  }

  const file = req.file;
  if (!file) throw ApiError.badRequest("No image file provided.");

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "vectrazai/avatars",
    public_id: req.user!.sub,
    overwrite: true,
    transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
  });

  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: { avatarUrl: result.secure_url },
  });

  res.json({ user: sanitizeUser(user) });
});
