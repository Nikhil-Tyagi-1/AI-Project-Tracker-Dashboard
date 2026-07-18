import type { ErrorRequestHandler } from "express";
import { env } from "../config/env";
import { AppError } from "../lib/errors";
import { errorResponse } from "../lib/response";

/**
 * Centralized Express error handler (must be registered last, after all routes).
 *
 * - Known `AppError` subclasses are mapped to their declared HTTP status and
 *   error code.
 * - Unknown errors are treated as 500 INTERNAL_ERROR. Stack traces are
 *   included in the response only outside production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    errorResponse(res, err.statusCode, err.message, err.code, err.details);
    return;
  }

  // Unrecognised error — log server-side, send generic 500.
  console.error("[errorHandler] Unhandled error:", err);

  const message =
    env.NODE_ENV !== "production" && err instanceof Error
      ? err.message
      : "An unexpected error occurred";

  errorResponse(res, 500, message, "INTERNAL_ERROR");
};
