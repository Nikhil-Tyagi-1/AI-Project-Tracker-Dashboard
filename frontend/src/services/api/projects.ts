import { apiClient } from "@/services/api/client";
import { apiRoutes } from "@/services/api/routes";
import type { ApiCollectionResponse, ApiSuccessResponse } from "@/types/api";
import type {
  CreateProjectInput,
  Project,
  ProjectListParams,
  ProjectListResult,
  UpdateProjectInput,
} from "@/types/project";

/**
 * Projects REST client.
 * Paths come from `apiRoutes`; transport uses the shared Axios `apiClient`.
 */

function toQueryParams(
  params?: ProjectListParams,
): Record<string, string | number | boolean> {
  if (!params) {
    return {};
  }

  const query: Record<string, string | number | boolean> = {};

  if (params.q !== undefined && params.q !== "") {
    query.q = params.q;
  }
  if (params.status) {
    query.status = params.status;
  }
  if (params.priority) {
    query.priority = params.priority;
  }
  if (params.owner !== undefined && params.owner !== "") {
    query.owner = params.owner;
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

/** GET /projects — paginated list with optional search/filter/sort. */
export async function getProjects(
  params?: ProjectListParams,
): Promise<ProjectListResult> {
  const response = await apiClient.get<ApiCollectionResponse<Project>>(
    apiRoutes.projects.root,
    { params: toQueryParams(params) },
  );

  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

/** GET /projects/:id — includes archived projects. */
export async function getProjectById(id: string): Promise<Project> {
  const response = await apiClient.get<ApiSuccessResponse<Project>>(
    apiRoutes.projects.byId(id),
  );
  return response.data.data;
}

/** POST /projects */
export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const response = await apiClient.post<ApiSuccessResponse<Project>>(
    apiRoutes.projects.root,
    input,
  );
  return response.data.data;
}

/** PATCH /projects/:id */
export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const response = await apiClient.patch<ApiSuccessResponse<Project>>(
    apiRoutes.projects.byId(id),
    input,
  );
  return response.data.data;
}

/** PATCH /projects/:id/archive */
export async function archiveProject(id: string): Promise<Project> {
  const response = await apiClient.patch<ApiSuccessResponse<Project>>(
    apiRoutes.projects.archive(id),
  );
  return response.data.data;
}

/** PATCH /projects/:id/restore */
export async function restoreProject(id: string): Promise<Project> {
  const response = await apiClient.patch<ApiSuccessResponse<Project>>(
    apiRoutes.projects.restore(id),
  );
  return response.data.data;
}

export const projectsApi = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
  restoreProject,
} as const;
