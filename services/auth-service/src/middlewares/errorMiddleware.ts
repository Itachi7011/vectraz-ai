import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  if (err instanceof Error && err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  console.error("[auth-service] Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error" });
}
