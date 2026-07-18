import { z } from "zod";
import { priorityEnum } from "./project";

// ---------------------------------------------------------------------------
// Enums — mirrors Prisma TaskStatus and spec.md §8.3
// Exported as const arrays for runtime use (e.g. seed scripts, service guards)
// and as Zod enums for schema composition.
// ---------------------------------------------------------------------------

export const TASK_STATUS_VALUES = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

export const taskStatusEnum = z.enum(TASK_STATUS_VALUES);

export type TaskStatus = z.infer<typeof taskStatusEnum>;

// ---------------------------------------------------------------------------
// Reusable field schemas
// ---------------------------------------------------------------------------

/** Accepts an ISO date/datetime string and coerces it to a Date object. */
const isoDate = z.coerce.date({
  error: "Must be a valid ISO date string",
});

/** Optional Kanban column order; integer ≥ 0. */
const sortOrderField = z
  .number()
  .int("sortOrder must be an integer")
  .min(0, "sortOrder must be at least 0");

// ---------------------------------------------------------------------------
// createTaskSchema — POST /api/tasks request body (spec.md §7.3, §8.4)
// ---------------------------------------------------------------------------

export const createTaskSchema = z.object({
  /** Required; 3–100 characters after trimming. */
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),

  /** Optional narrative; max 2000 characters. */
  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),

  /** FK to Project.id. Must be a non-empty string (existence checked in service). */
  projectId: z.string().min(1, "projectId is required"),

  /** Optional FK to User.id. */
  assigneeId: z.string().min(1, "assigneeId must not be empty").optional(),

  /** Must be a valid TaskStatus enum value. Defaults to TODO. */
  status: taskStatusEnum.default("TODO"),

  /** Must be a valid Priority enum value. Defaults to MEDIUM. */
  priority: priorityEnum.default("MEDIUM"),

  /** Optional ISO date for the task deadline. */
  dueDate: isoDate.optional(),

  /** Optional ordering within a Kanban column. Defaults to 0. */
  sortOrder: sortOrderField.default(0),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// ---------------------------------------------------------------------------
// updateTaskSchema — PATCH /api/tasks/:id request body
// All fields are optional; only the provided ones are applied.
// Nullable variants allow clients to explicitly clear optional fields.
// projectId is intentionally omitted — tasks cannot be reassigned across projects.
// ---------------------------------------------------------------------------

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters")
    .nullish(),

  assigneeId: z.string().min(1, "assigneeId must not be empty").nullish(),

  status: taskStatusEnum.optional(),

  priority: priorityEnum.optional(),

  dueDate: isoDate.nullish(),

  /** Used with status for Kanban column persistence. */
  sortOrder: sortOrderField.optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// ---------------------------------------------------------------------------
// taskListQuerySchema — GET /api/tasks query params (spec.md §7.3, §9–10)
// All params come in as strings from the query string; coerce where needed.
// ---------------------------------------------------------------------------

const SORT_BY_VALUES = [
  "title",
  "createdAt",
  "updatedAt",
  "priority",
  "dueDate",
  "sortOrder",
  "status",
] as const;

const SORT_ORDER_VALUES = ["asc", "desc"] as const;

export const taskListQuerySchema = z.object({
  /** Scope results to a single project (required for single-project Kanban). */
  projectId: z.string().min(1, "projectId must not be empty").optional(),

  /** Filter by task status enum value (Kanban column). */
  status: taskStatusEnum.optional(),

  /** Filter by priority enum value. */
  priority: priorityEnum.optional(),

  /** Filter by assignee user id. */
  assigneeId: z.string().min(1, "assigneeId must not be empty").optional(),

  /**
   * Case-insensitive partial match on task title (and optionally description).
   * Empty/omitted means no search constraint.
   */
  search: z.string().optional(),

  /** Field to sort by. Defaults to sortOrder for Kanban-friendly ordering. */
  sortBy: z.enum(SORT_BY_VALUES).default("sortOrder"),

  /** Sort direction. Defaults to asc. */
  sortOrder: z.enum(SORT_ORDER_VALUES).default("asc"),

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
   * When true, archived tasks are included in results.
   * Accepts boolean true/false or the strings "true"/"false" (query params arrive
   * as strings from the HTTP layer).
   */
  includeArchived: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true")
    .default(false),
});

export type TaskListQuery = z.infer<typeof taskListQuerySchema>;

// ---------------------------------------------------------------------------
// Convenience validator functions
// Re-export schemas as parse/safeParse wrappers for direct use in controllers.
// ---------------------------------------------------------------------------

export const validateCreateTask = (data: unknown) =>
  createTaskSchema.safeParse(data);

export const validateUpdateTask = (data: unknown) =>
  updateTaskSchema.safeParse(data);

export const validateTaskListQuery = (data: unknown) =>
  taskListQuerySchema.safeParse(data);
