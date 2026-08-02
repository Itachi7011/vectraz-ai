import crypto from "crypto";
import bcrypt from "bcryptjs";

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  // Cryptographically-random 6-digit code, zero-padded.
  const n = crypto.randomInt(0, 10 ** OTP_LENGTH);
  return n.toString().padStart(OTP_LENGTH, "0");
}

export async function hashOtpCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function compareOtpCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

/** SHA-256 hash used for storing refresh tokens at rest (fast, deterministic — unlike bcrypt, which is intentionally slow and randomized, so it can't be used for a lookup-by-hash query). */
export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
