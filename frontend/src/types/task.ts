import type { Priority, TaskStatus } from "@/constants/enums";
import type { PaginationMeta } from "@/types/api";

/**
 * Task domain types aligned with docs/api/tasks.md.
 * Full tasks feature slice lands in Milestone 7; detail summary only needs list + counts.
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

export type TaskListParams = {
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  search?: string;
  sortBy?:
    | "title"
    | "createdAt"
    | "updatedAt"
    | "priority"
    | "dueDate"
    | "sortOrder"
    | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
};

export type TaskListResult = {
  data: Task[];
  meta: PaginationMeta;
};

export type TaskStatusSummary = {
  total: number;
  byStatus: Record<TaskStatus, number>;
  doneCount: number;
  openCount: number;
};
