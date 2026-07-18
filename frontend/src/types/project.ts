import type { Priority, ProjectStatus } from "@/constants/enums";
import type { PaginationMeta } from "@/types/api";

/**
 * Project domain types aligned with docs/api/projects.md and the backend
 * ProjectWithOwner response shape.
 */

export type ProjectOwner = {
  id: string;
  name: string;
  email: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  ownerId: string;
  owner: ProjectOwner;
  startDate: string | null;
  endDate: string | null;
  riskNotes: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSortBy =
  | "name"
  | "createdAt"
  | "updatedAt"
  | "priority"
  | "progress";

export type SortOrder = "asc" | "desc";

/** Query params for GET /projects (mirrors backend projectListQuerySchema). */
export type ProjectListParams = {
  q?: string;
  status?: ProjectStatus;
  priority?: Priority;
  owner?: string;
  sortBy?: ProjectSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
};

export type ProjectListMeta = PaginationMeta;

export type ProjectListResult = {
  data: Project[];
  meta: ProjectListMeta;
};

/** Body for POST /projects. */
export type CreateProjectInput = {
  name: string;
  ownerId: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  progress?: number;
  startDate?: string;
  endDate?: string;
  riskNotes?: string;
};

/**
 * Body for PATCH /projects/:id.
 * `null` clears nullable fields (description, dates, riskNotes).
 */
export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: Priority;
  ownerId?: string;
  startDate?: string | null;
  endDate?: string | null;
  progress?: number;
  riskNotes?: string | null;
};
