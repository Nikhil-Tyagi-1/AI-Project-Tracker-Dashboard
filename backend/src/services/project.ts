import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { ConflictError, NotFoundError, ValidationError } from "../lib/errors";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectListQuery,
} from "../validators/project";

// ---------------------------------------------------------------------------
// Return type
// Includes the related User (id, name, email) so API responses can surface
// the owner's display name without a second round-trip.
// ---------------------------------------------------------------------------

const PROJECT_INCLUDE = {
  owner: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ProjectInclude;

export type ProjectWithOwner = Prisma.ProjectGetPayload<{
  include: typeof PROJECT_INCLUDE;
}>;

// ---------------------------------------------------------------------------
// Status transition table (spec.md §8.1)
// From COMPLETED the only allowed transitions are reopen moves (PLANNED | IN_PROGRESS).
// ---------------------------------------------------------------------------

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ["IN_PROGRESS", "ON_HOLD", "AT_RISK", "COMPLETED"],
  IN_PROGRESS: ["PLANNED", "ON_HOLD", "AT_RISK", "COMPLETED"],
  ON_HOLD: ["PLANNED", "IN_PROGRESS", "AT_RISK", "COMPLETED"],
  AT_RISK: ["PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"],
  COMPLETED: ["PLANNED", "IN_PROGRESS"],
};

// ---------------------------------------------------------------------------
// Priority sort weight (SQLite sorts enum strings alphabetically,
// which does not match LOW < MEDIUM < HIGH < CRITICAL semantics)
// ---------------------------------------------------------------------------

// Keyed by the Prisma Priority string union; `?? 0` satisfies noUncheckedIndexedAccess.
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
 * Look up a project row; throw NotFoundError when absent.
 * Pass `includeArchived: true` when the caller needs to act on archived rows
 * (archive, restore, update pre-check).
 */
async function findProjectOrThrow(
  id: string,
  { includeArchived = false } = {},
): Promise<ProjectWithOwner> {
  const row = await prisma.project.findFirst({
    where: {
      id,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    include: PROJECT_INCLUDE,
  });

  if (!row) {
    throw new NotFoundError(`Project "${id}" not found`);
  }

  return row;
}

/**
 * Throw ConflictError when a non-archived project with the same name (case-insensitive)
 * already exists, optionally excluding `excludeId` (used during updates).
 */
async function assertNameUnique(name: string, excludeId?: string): Promise<void> {
  const conflict = await prisma.project.findFirst({
    where: {
      // contains + SQLite LIKE gives case-insensitive match for ASCII names
      name: { contains: name },
      isArchived: false,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, name: true },
  });

  // contains is a substring match; do an exact case-insensitive comparison in JS
  if (conflict && conflict.name.toLowerCase() === name.toLowerCase()) {
    throw new ConflictError(
      `A non-archived project named "${name}" already exists`,
    );
  }
}

/**
 * Throw ValidationError when the requested status move violates the transition table.
 * Same-status "transitions" (no-ops) are always permitted.
 */
function assertValidTransition(from: string, to: string): void {
  if (from === to) return;

  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ValidationError(
      `Status transition from ${from} to ${to} is not permitted`,
      [{ path: "status", message: `Cannot move from ${from} to ${to}` }],
    );
  }
}

/**
 * Throw ValidationError when status is COMPLETED but progress is not 100 (spec §8.1).
 */
function assertCompletionProgress(status: string, progress: number): void {
  if (status === "COMPLETED" && progress !== 100) {
    throw new ValidationError(
      "Progress must be 100 to set status to COMPLETED",
      [{ path: "progress", message: "Progress must be 100 when status is COMPLETED" }],
    );
  }
}

/**
 * Build the Prisma WHERE input from list-query filters.
 * Keeps listProjects readable and makes the filter logic individually testable.
 *
 * NOTE: mode: "insensitive" is PostgreSQL-only in Prisma. SQLite's LIKE operator
 * (used by `contains`) is already case-insensitive for ASCII characters, which
 * covers all enum values and typical project names in this MVP.
 */
function buildProjectWhere(
  query: Pick<ProjectListQuery, "q" | "status" | "priority" | "owner" | "includeArchived">,
): Prisma.ProjectWhereInput {
  const { q, status, priority, owner, includeArchived } = query;

  return {
    ...(includeArchived ? {} : { isArchived: false }),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    // Filter by owner display name; contains uses LIKE (case-insensitive on SQLite for ASCII).
    ...(owner ? { owner: { name: { contains: owner } } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface ProjectListResult {
  data: ProjectWithOwner[];
  meta: { total: number; page: number; pageSize: number };
}

// ---------------------------------------------------------------------------
// listProjects
// ---------------------------------------------------------------------------

/**
 * Return a paginated, filtered, sorted list of projects.
 *
 * Priority sorting is performed in-memory because SQLite sorts enum values
 * alphabetically, which does not match the LOW < MEDIUM < HIGH < CRITICAL order.
 * All other sort fields delegate to the database.
 */
export async function listProjects(
  query: ProjectListQuery,
): Promise<ProjectListResult> {
  const { sortBy, sortOrder, page, pageSize } = query;
  const where = buildProjectWhere(query);
  const skip = (page - 1) * pageSize;

  if (sortBy === "priority") {
    // Fetch all matching rows then sort + paginate in memory.
    const [total, rows] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({ where, include: PROJECT_INCLUDE }),
    ]);

    const sorted = rows.sort((a, b) => {
      const diff = (PRIORITY_WEIGHT[a.priority] ?? 0) - (PRIORITY_WEIGHT[b.priority] ?? 0);
      return sortOrder === "asc" ? diff : -diff;
    });

    return {
      data: sorted.slice(skip, skip + pageSize),
      meta: { total, page, pageSize },
    };
  }

  // All other fields are sortable directly in the database.
  const orderBy: Prisma.ProjectOrderByWithRelationInput = { [sortBy]: sortOrder };

  const [total, data] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: PROJECT_INCLUDE,
    }),
  ]);

  return { data, meta: { total, page, pageSize } };
}

// ---------------------------------------------------------------------------
// getProjectById
// ---------------------------------------------------------------------------

/**
 * Return a single project by id.
 * Archived projects are included so callers can display the archived state
 * and surface a restore action.
 */
export async function getProjectById(id: string): Promise<ProjectWithOwner> {
  return findProjectOrThrow(id, { includeArchived: true });
}

// ---------------------------------------------------------------------------
// createProject
// ---------------------------------------------------------------------------

export async function createProject(
  input: CreateProjectInput,
): Promise<ProjectWithOwner> {
  await assertNameUnique(input.name);

  // Zod defaults guarantee status and progress are always present after parse.
  assertCompletionProgress(input.status, input.progress);

  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      priority: input.priority,
      ownerId: input.ownerId,
      startDate: input.startDate,
      endDate: input.endDate,
      progress: input.progress,
      riskNotes: input.riskNotes,
    },
    include: PROJECT_INCLUDE,
  });
}

// ---------------------------------------------------------------------------
// updateProject
// ---------------------------------------------------------------------------

/**
 * Apply a partial update to a project.
 *
 * Business rules enforced:
 *   - Archived projects are rejected (restore first).
 *   - Name changes must remain unique among non-archived projects.
 *   - Status transitions must follow the permitted table.
 *   - Setting COMPLETED requires progress === 100 in the resulting state.
 */
export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<ProjectWithOwner> {
  const project = await findProjectOrThrow(id, { includeArchived: true });

  if (project.isArchived) {
    throw new ValidationError(
      "Archived projects cannot be updated. Restore the project first.",
      [{ path: "id", message: "Project is archived" }],
    );
  }

  if (input.name !== undefined && input.name !== project.name) {
    await assertNameUnique(input.name, id);
  }

  if (input.status !== undefined) {
    assertValidTransition(project.status, input.status);
  }

  const resultingStatus = input.status ?? project.status;
  const resultingProgress = input.progress !== undefined ? input.progress : project.progress;
  assertCompletionProgress(resultingStatus, resultingProgress);

  // Build the update payload; undefined fields are omitted (no change).
  // null is forwarded explicitly to clear nullable columns.
  const data: Prisma.ProjectUpdateInput = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.ownerId !== undefined ? { owner: { connect: { id: input.ownerId } } } : {}),
    ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
    ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
    ...(input.progress !== undefined ? { progress: input.progress } : {}),
    ...(input.riskNotes !== undefined ? { riskNotes: input.riskNotes } : {}),
  };

  return prisma.project.update({
    where: { id },
    data,
    include: PROJECT_INCLUDE,
  });
}

// ---------------------------------------------------------------------------
// archiveProject
// ---------------------------------------------------------------------------

/**
 * Soft-delete a project by setting isArchived = true.
 * Idempotent: returns the project unchanged if already archived.
 */
export async function archiveProject(id: string): Promise<ProjectWithOwner> {
  const project = await findProjectOrThrow(id, { includeArchived: true });

  if (project.isArchived) {
    return project;
  }

  return prisma.project.update({
    where: { id },
    data: { isArchived: true },
    include: PROJECT_INCLUDE,
  });
}

// ---------------------------------------------------------------------------
// restoreProject
// ---------------------------------------------------------------------------

/**
 * Restore an archived project by setting isArchived = false.
 * Idempotent: returns the project unchanged if already active.
 *
 * Name uniqueness is re-checked before restoring: another project may have
 * been created with the same name while this one was archived.
 */
export async function restoreProject(id: string): Promise<ProjectWithOwner> {
  const project = await findProjectOrThrow(id, { includeArchived: true });

  if (!project.isArchived) {
    return project;
  }

  await assertNameUnique(project.name, id);

  return prisma.project.update({
    where: { id },
    data: { isArchived: false },
    include: PROJECT_INCLUDE,
  });
}
