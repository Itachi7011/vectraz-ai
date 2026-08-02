import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@vectrazai/db";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export type AccessTokenPayload = {
  sub: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken as string;
  return null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized("Authentication required");

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw ApiError.unauthorized("User no longer exists");
    if (user.isBlocked) throw ApiError.forbidden("This account has been blocked");

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

/** Attaches req.user if a valid token is present, but never blocks the request. Used on public routes that personalize output when logged in (e.g. category preferences). */
export async function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.user = payload;
  } catch {
    // ignore invalid/expired tokens on optional-auth routes
  }
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role !== "ADMIN") return next(ApiError.forbidden("Admin access required"));
  next();
}
