import { apiClient } from "@/services/api/client";
import { apiRoutes } from "@/services/api/routes";
import type { ApiSuccessResponse } from "@/types/api";
import type { DashboardInsights, DashboardSummary } from "@/types/dashboard";

/**
 * Dashboard REST client.
 * Paths come from `apiRoutes`; transport uses the shared Axios `apiClient`.
 */

/** GET /dashboard/summary — metric cards + chart-ready series. */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<ApiSuccessResponse<DashboardSummary>>(
    apiRoutes.dashboard.summary,
  );
  return response.data.data;
}

/** GET /dashboard/insights — mock Smart Insights (Milestone 8 follow-up). */
export async function getDashboardInsights(): Promise<DashboardInsights> {
  const response = await apiClient.get<ApiSuccessResponse<DashboardInsights>>(
    apiRoutes.dashboard.insights,
  );
  return response.data.data;
}

export const dashboardApi = {
  getDashboardSummary,
  getDashboardInsights,
} as const;
