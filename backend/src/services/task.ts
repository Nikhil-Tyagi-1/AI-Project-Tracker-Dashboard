import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { NotFoundError, ValidationError } from "../lib/errors";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListQuery,
} from "../validators/task";

// ---------------------------------------------------------------------------
// Return type
// Includes assignee and a slim project projection so API responses can surface
// display names without a second round-trip (Kanban cards, multi-project lists).
// ---------------------------------------------------------------------------

const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true, isArchived: true } },
} satisfies Prisma.TaskInclude;

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof TASK_INCLUDE;
}>;

// ---------------------------------------------------------------------------
// Priority sort weight (SQLite sorts enum strings alphabetically,
// which does not match LOW < MEDIUM < HIGH < CRITICAL semantics)
// ---------------------------------------------------------------------------

const PRIORITY_WEIGHT: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Look up a task row; throw NotFoundError when absent.
 * Pass `includeArchived: true` when the caller needs to act on archived rows
 * (archive, restore, update pre-check, getById).
 */
async function findTaskOrThrow(
  id: string,
  { includeArchived = false } = {},
): Promise<TaskWithRelations> {
  const row = await prisma.task.findFirst({
    where: {
      id,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    include: TASK_INCLUDE,
  });

  if (!row) {
    throw new NotFoundError(`Task "${id}" not found`);
  }

  return row;
}

/**
 * Ensure the target project exists and is not archived.
 * Missing → NotFoundError; archived → ValidationError.
 * Used when creating tasks (spec.md §8.4).
 */
async function assertProjectAcceptsTasks(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, isArchived: true },
  });

  if (!project) {
    throw new NotFoundError(`Project "${projectId}" not found`);
  }

  if (project.isArchived) {
    throw new ValidationError(
      "Cannot create a task on an archived project. Restore the project first.",
      [{ path: "projectId", message: "Project is archived" }],
    );
  }
}

/**
 * Build the Prisma WHERE input from list-query filters.
 * Keeps listTasks readable and makes the filter logic individually testable.
 *
 * NOTE: mode: "insensitive" is PostgreSQL-only in Prisma. SQLite's LIKE operator
 * (used by `contains`) is already case-insensitive for ASCII characters.
 */
function buildTaskWhere(
  query: Pick<
    TaskListQuery,
    | "projectId"
    | "status"
    | "priority"
    | "assigneeId"
    | "search"
    | "includeArchived"
  >,
): Prisma.TaskWhereInput {
  const { projectId, status, priority, assigneeId, search, includeArchived } =
    query;

  const trimmedSearch = search?.trim();

  return {
    ...(includeArchived ? {} : { isArchived: false }),
    ...(projectId ? { projectId } : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(assigneeId ? { assigneeId } : {}),
    ...(trimmedSearch
      ? {
          title: { contains: trimmedSearch },
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface TaskListResult {
  data: TaskWithRelations[];
  meta: { total: number; page: number; pageSize: number };
}

// ---------------------------------------------------------------------------
// listTasks
// ---------------------------------------------------------------------------

/**
 * Return a paginated, filtered, sorted list of tasks.
 *
 * Archived tasks are excluded by default (`includeArchived: false`).
 * Priority sorting is performed in-memory because SQLite sorts enum values
 * alphabetically. All other sort fields delegate to the database.
 */
export async function listTasks(query: TaskListQuery): Promise<TaskListResult> {
  const { sortBy, sortOrder, page, pageSize } = query;
  const where = buildTaskWhere(query);
  const skip = (page - 1) * pageSize;

  if (sortBy === "priority") {
    const [total, rows] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({ where, include: TASK_INCLUDE }),
    ]);

    const sorted = rows.sort((a, b) => {
      const diff =
        (PRIORITY_WEIGHT[a.priority] ?? 0) - (PRIORITY_WEIGHT[b.priority] ?? 0);
      return sortOrder === "asc" ? diff : -diff;
    });

    return {
      data: sorted.slice(skip, skip + pageSize),
      meta: { total, page, pageSize },
    };
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput = { [sortBy]: sortOrder };

  const [total, data] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: TASK_INCLUDE,
    }),
  ]);

  return { data, meta: { total, page, pageSize } };
}

// ---------------------------------------------------------------------------
// getTaskById
// ---------------------------------------------------------------------------

/**
 * Return a single task by id.
 * Archived tasks are included so callers can display the archived state
 * and surface a restore action.
 */
export async function getTaskById(id: string): Promise<TaskWithRelations> {
  return findTaskOrThrow(id, { includeArchived: true });
}

// ---------------------------------------------------------------------------
// createTask
// ---------------------------------------------------------------------------

/**
 * Create a task under a project.
 *
 * Business rules:
 *   - projectId must reference an existing project (NotFoundError otherwise).
 *   - The project must not be archived (ValidationError otherwise).
 *   - status / sortOrder are accepted so Kanban-friendly defaults apply.
 */
export async function createTask(
  input: CreateTaskInput,
): Promise<TaskWithRelations> {
  await assertProjectAcceptsTasks(input.projectId);

  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      assigneeId: input.assigneeId,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      sortOrder: input.sortOrder,
    },
    include: TASK_INCLUDE,
  });
}

// ---------------------------------------------------------------------------
// updateTask
// ---------------------------------------------------------------------------

/**
 * Apply a partial update to a task.
 *
 * Business rules enforced:
 *   - Archived tasks are rejected (restore first).
 *   - status and sortOrder may be updated together for Kanban persistence.
 *   - projectId cannot be changed (omitted from UpdateTaskInput).
 *   - null clears nullable columns (description, assigneeId, dueDate).
 */
export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<TaskWithRelations> {
  const task = await findTaskOrThrow(id, { includeArchived: true });

  if (task.isArchived) {
    throw new ValidationError(
      "Archived tasks cannot be updated. Restore the task first.",
      [{ path: "id", message: "Task is archived" }],
    );
  }

  const data: Prisma.TaskUpdateInput = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    ...(input.assigneeId !== undefined
      ? input.assigneeId === null
        ? { assignee: { disconnect: true } }
        : { assignee: { connect: { id: input.assigneeId } } }
      : {}),
  };

  return prisma.task.update({
    where: { id },
    data,
    include: TASK_INCLUDE,
  });
}

// ---------------------------------------------------------------------------
// archiveTask
// ---------------------------------------------------------------------------

/**
 * Soft-delete a task by setting isArchived = true.
 * Idempotent: returns the task unchanged if already archived.
 */
export async function archiveTask(id: string): Promise<TaskWithRelations> {
  const task = await findTaskOrThrow(id, { includeArchived: true });

  if (task.isArchived) {
    return task;
  }

  return prisma.task.update({
    where: { id },
    data: { isArchived: true },
    include: TASK_INCLUDE,
  });
}

// ---------------------------------------------------------------------------
// restoreTask
// ---------------------------------------------------------------------------

/**
 * Restore an archived task by setting isArchived = false.
 * Idempotent: returns the task unchanged if already active.
 */
export async function restoreTask(id: string): Promise<TaskWithRelations> {
  const task = await findTaskOrThrow(id, { includeArchived: true });

  if (!task.isArchived) {
    return task;
  }

  return prisma.task.update({
    where: { id },
    data: { isArchived: false },
    include: TASK_INCLUDE,
  });
}
