import { z } from "zod";

/**
 * Shared Zod helpers for forms and client-side request shaping.
 * Feature schemas live next to their feature modules under src/features/*.
 */
export { z };

export const nonEmptyString = (max: number, min = 1) =>
  z.string().trim().min(min).max(max);
