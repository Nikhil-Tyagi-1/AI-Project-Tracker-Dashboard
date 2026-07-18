import { z } from "zod";

/**
 * Shared Zod helpers for request validation.
 * Feature schemas live under src/validators/<feature>.ts.
 */
export { z };

export const nonEmptyString = (max: number, min = 1) =>
  z.string().trim().min(min).max(max);

// Feature validators
export * from "./project";
