import { apiClient } from "@/services/api/client";
import { apiRoutes } from "@/services/api/routes";
import type { ApiCollectionResponse, ApiSuccessResponse } from "@/types/api";
import type {
  CreateTaskInput,
  Task,
  TaskListParams,
  TaskListResult,
  UpdateTaskInput,
} from "@/types/task";

/**
 * Tasks REST client.
 * Paths come from `apiRoutes`; transport uses the shared Axios `apiClient`.
 */

function toQueryParams(
  params?: TaskListParams,
): Record<string, string | number | boolean> {
  if (!params) {
    return {};
  }

  const query: Record<string, string | number | boolean> = {};

  if (params.projectId) {
    query.projectId = params.projectId;
  }
  if (params.status) {
    query.status = params.status;
  }
  if (params.priority) {
    query.priority = params.priority;
  }
  if (params.assigneeId !== undefined && params.assigneeId !== "") {
    query.assigneeId = params.assigneeId;
  }
  if (params.search !== undefined && params.search !== "") {
    query.search = params.search;
  }
  if (params.sortBy) {
    query.sortBy = params.sortBy;
  }
  if (params.sortOrder) {
    query.sortOrder = params.sortOrder;
  }
  if (params.page !== undefined) {
    query.page = params.page;
  }
  if (params.pageSize !== undefined) {
    query.pageSize = params.pageSize;
  }
  if (params.includeArchived !== undefined) {
    query.includeArchived = params.includeArchived;
  }

  return query;
}

/** GET /tasks — paginated list with optional project scope, search, and filters. */
export async function getTasks(
  params?: TaskListParams,
): Promise<TaskListResult> {
  const response = await apiClient.get<ApiCollectionResponse<Task>>(
    apiRoutes.tasks.root,
    { params: toQueryParams(params) },
  );

  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

/** GET /tasks/:id — includes archived tasks. */
export async function getTaskById(id: string): Promise<Task> {
  const response = await apiClient.get<ApiSuccessResponse<Task>>(
    apiRoutes.tasks.byId(id),
  );
  return response.data.data;
}

/** POST /tasks */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await apiClient.post<ApiSuccessResponse<Task>>(
    apiRoutes.tasks.root,
    input,
  );
  return response.data.data;
}

/** PATCH /tasks/:id */
export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const response = await apiClient.patch<ApiSuccessResponse<Task>>(
    apiRoutes.tasks.byId(id),
    input,
  );
  return response.data.data;
}

/** PATCH /tasks/:id/archive */
export async function archiveTask(id: string): Promise<Task> {
  const response = await apiClient.patch<ApiSuccessResponse<Task>>(
    apiRoutes.tasks.archive(id),
  );
  return response.data.data;
}

/** PATCH /tasks/:id/restore */
export async function restoreTask(id: string): Promise<Task> {
  const response = await apiClient.patch<ApiSuccessResponse<Task>>(
    apiRoutes.tasks.restore(id),
  );
  return response.data.data;
}

export const tasksApi = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  archiveTask,
  restoreTask,
} as const;
