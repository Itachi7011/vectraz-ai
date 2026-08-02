import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { prisma } from "@vectrazai/db";

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

    const payload = verifyAccessToken(token);

    // Defense in depth: re-check the user hasn't been blocked since the
    // token was issued (a 15-minute access token could otherwise let a
    // just-blocked user keep acting until it expires).
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

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role !== "ADMIN") return next(ApiError.forbidden("Admin access required"));
  next();
}
