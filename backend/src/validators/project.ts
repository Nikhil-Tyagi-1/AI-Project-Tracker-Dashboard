import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums — mirrors Prisma enums and spec.md §8.1–8.2
// Exported as const arrays for runtime use (e.g. seed scripts, service guards)
// and as Zod enums for schema composition.
// ---------------------------------------------------------------------------

export const PROJECT_STATUS_VALUES = [
  "PLANNED",
  "IN_PROGRESS",
  "ON_HOLD",
  "AT_RISK",
  "COMPLETED",
] as const;

export const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const projectStatusEnum = z.enum(PROJECT_STATUS_VALUES);
export const priorityEnum = z.enum(PRIORITY_VALUES);

export type ProjectStatus = z.infer<typeof projectStatusEnum>;
export type Priority = z.infer<typeof priorityEnum>;

// ---------------------------------------------------------------------------
// Reusable field schemas
// ---------------------------------------------------------------------------

/** Accepts an ISO date/datetime string and coerces it to a Date object. */
const isoDate = z.coerce.date({
  error: "Must be a valid ISO date string",
});

/** Cross-field refinement: endDate must not precede startDate. */
function validateDateOrder(
  data: { startDate?: Date | null; endDate?: Date | null },
  ctx: z.RefinementCtx,
) {
  if (data.startDate != null && data.endDate != null) {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endDate must be on or after startDate",
        path: ["endDate"],
      });
    }
  }
}

// ---------------------------------------------------------------------------
// createProjectSchema — POST /api/projects request body (spec.md §7.2, §8.4)
// ---------------------------------------------------------------------------

export const createProjectSchema = z
  .object({
    /** Required; 3–100 characters after trimming. */
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be at most 100 characters"),

    /** Optional narrative; max 2000 characters. */
    description: z
      .string()
      .trim()
      .max(2000, "Description must be at most 2000 characters")
      .optional(),

    /** Must be a valid ProjectStatus enum value. Defaults to PLANNED. */
    status: projectStatusEnum.default("PLANNED"),

    /** Must be a valid Priority enum value. Defaults to MEDIUM. */
    priority: priorityEnum.default("MEDIUM"),

    /** FK to User.id. Must be a non-empty string. */
    ownerId: z.string().min(1, "ownerId is required"),

    /** Optional ISO date; used as project start. */
    startDate: isoDate.optional(),

    /** Optional ISO date; must not precede startDate when both are provided. */
    endDate: isoDate.optional(),

    /** Integer 0–100 representing completion percentage. Defaults to 0. */
    progress: z
      .number()
      .int("Progress must be an integer")
      .min(0, "Progress must be at least 0")
      .max(100, "Progress must be at most 100")
      .default(0),

    /** Optional risk/blocker narrative; max 2000 characters. */
    riskNotes: z
      .string()
      .trim()
      .max(2000, "Risk notes must be at most 2000 characters")
      .optional(),
  })
  .superRefine(validateDateOrder);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// ---------------------------------------------------------------------------
// updateProjectSchema — PATCH /api/projects/:id request body
// All fields are optional; only the provided ones are applied.
// Nullable variants allow clients to explicitly clear optional fields.
// ---------------------------------------------------------------------------

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be at most 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000, "Description must be at most 2000 characters")
      .nullish(),

    status: projectStatusEnum.optional(),

    priority: priorityEnum.optional(),

    ownerId: z.string().min(1, "ownerId must not be empty").optional(),

    startDate: isoDate.nullish(),

    endDate: isoDate.nullish(),

    progress: z
      .number()
      .int("Progress must be an integer")
      .min(0, "Progress must be at least 0")
      .max(100, "Progress must be at most 100")
      .optional(),

    riskNotes: z
      .string()
      .trim()
      .max(2000, "Risk notes must be at most 2000 characters")
      .nullish(),
  })
  .superRefine(validateDateOrder);

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ---------------------------------------------------------------------------
// projectListQuerySchema — GET /api/projects query params (spec.md §7.2, §10)
// All params come in as strings from the query string; coerce where needed.
// ---------------------------------------------------------------------------

const SORT_BY_VALUES = [
  "name",
  "createdAt",
  "updatedAt",
  "priority",
  "progress",
] as const;

const SORT_ORDER_VALUES = ["asc", "desc"] as const;

export const projectListQuerySchema = z.object({
  /** Case-insensitive partial match on project name (and optionally description). */
  q: z.string().optional(),

  /** Filter by project status enum value. */
  status: projectStatusEnum.optional(),

  /** Filter by priority enum value. */
  priority: priorityEnum.optional(),

  /** Filter by owner name string (exact or provided by select control). */
  owner: z.string().optional(),

  /** Field to sort by. Defaults to createdAt. */
  sortBy: z.enum(SORT_BY_VALUES).default("createdAt"),

  /** Sort direction. Defaults to desc. */
  sortOrder: z.enum(SORT_ORDER_VALUES).default("desc"),

  /** 1-based page number. Coerced from query string. */
  page: z.coerce
    .number()
    .int()
    .positive("page must be a positive integer")
    .default(1),

  /** Number of items per page; max 100. Coerced from query string. */
  pageSize: z.coerce
    .number()
    .int()
    .min(1, "pageSize must be at least 1")
    .max(100, "pageSize cannot exceed 100")
    .default(20),

  /**
   * When true, archived projects are included in results.
   * Accepts boolean true/false or the strings "true"/"false" (query params arrive
   * as strings from the HTTP layer).
   */
  includeArchived: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true")
    .default(false),
});

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

// ---------------------------------------------------------------------------
// Convenience validator functions
// Re-export schemas as parse/safeParse wrappers for direct use in controllers.
// ---------------------------------------------------------------------------

export const validateCreateProject = (data: unknown) =>
  createProjectSchema.safeParse(data);

export const validateUpdateProject = (data: unknown) =>
  updateProjectSchema.safeParse(data);

export const validateProjectListQuery = (data: unknown) =>
  projectListQuerySchema.safeParse(data);
