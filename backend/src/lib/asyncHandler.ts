import type { RequestHandler } from "express";

/**
 * Wraps an async Express request handler and forwards any thrown or rejected
 * errors to the next() error pipeline, so they reach the centralized
 * errorHandler middleware rather than causing an unhandled-promise-rejection.
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
