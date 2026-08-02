import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const flattened = result.error.flatten();
      return next(ApiError.badRequest("Validation failed", flattened.fieldErrors));
    }

    // Overwrite with parsed/coerced values (e.g. lowercased emails).
    if (result.data.body) req.body = result.data.body;
    next();
  };
}
