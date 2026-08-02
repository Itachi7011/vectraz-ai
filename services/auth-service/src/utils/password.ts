import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Password strength policy, enforced on top of zod's shape checks:
 * min 8 chars, at least one letter, one number, one special character.
 * Rejects the most common leaked/weak passwords outright.
 */
const COMMON_WEAK_PASSWORDS = new Set([
  "password",
  "password1",
  "12345678",
  "123456789",
  "qwerty123",
  "letmein123",
  "admin1234",
]);

export function isPasswordStrongEnough(plain: string): boolean {
  if (plain.length < 8) return false;
  if (!/[A-Za-z]/.test(plain)) return false;
  if (!/[0-9]/.test(plain)) return false;
  if (!/[^A-Za-z0-9]/.test(plain)) return false;
  if (COMMON_WEAK_PASSWORDS.has(plain.toLowerCase())) return false;
  return true;
}
