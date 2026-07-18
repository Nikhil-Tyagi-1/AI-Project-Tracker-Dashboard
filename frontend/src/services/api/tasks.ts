import { apiClient } from "@/services/api/client";
import { apiRoutes } from "@/services/api/routes";
import type { ApiCollectionResponse } from "@/types/api";
import type { Task, TaskListParams, TaskListResult } from "@/types/task";

/**
 * Minimal Tasks REST client for project detail summaries.
 * Full CRUD + Redux land in Milestone 7.
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
  if (params.assigneeId) {
    query.assigneeId = params.assigneeId;
  }
  if (params.search) {
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

/** GET /tasks — paginated list (optionally scoped by projectId). */
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
