import type { Priority, TaskStatus } from "@/constants/enums";
import type { PaginationMeta } from "@/types/api";
import type { SortOrder } from "@/types/project";

/**
 * Task domain types aligned with docs/api/tasks.md and the backend
 * TaskWithRelations response shape.
 */

export type TaskProjectSummary = {
  id: string;
  name: string;
  isArchived: boolean;
};

export type TaskAssignee = {
  id: string;
  name: string;
  email: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  sortOrder: number;
  projectId: string;
  project: TaskProjectSummary;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskSortBy =
  | "title"
  | "createdAt"
  | "updatedAt"
  | "priority"
  | "dueDate"
  | "sortOrder"
  | "status";

/** Query params for GET /tasks (mirrors backend taskListQuerySchema). */
export type TaskListParams = {
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  search?: string;
  sortBy?: TaskSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
};

export type TaskListMeta = PaginationMeta;

export type TaskListResult = {
  data: Task[];
  meta: TaskListMeta;
};

/** Body for POST /tasks. */
export type CreateTaskInput = {
  title: string;
  projectId: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
  sortOrder?: number;
};

/**
 * Body for PATCH /tasks/:id.
 * `null` clears nullable fields (description, assigneeId, dueDate).
 * `projectId` cannot be changed after create.
 */
export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
  sortOrder?: number;
};

export type TaskStatusSummary = {
  total: number;
  byStatus: Record<TaskStatus, number>;
  doneCount: number;
  openCount: number;
};
