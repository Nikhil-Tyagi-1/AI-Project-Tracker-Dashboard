import { z } from "zod";

/**
 * Shared Zod helpers for request validation.
 * Feature schemas will live under src/validators/* as APIs are implemented.
 */
export { z };

export const nonEmptyString = (max: number, min = 1) =>
  z.string().trim().min(min).max(max);
