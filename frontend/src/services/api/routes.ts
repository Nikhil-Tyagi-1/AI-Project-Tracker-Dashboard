/**
 * API path segments relative to NEXT_PUBLIC_API_BASE_URL.
 * Keep route strings here to avoid scattering hardcoded paths across features.
 */
export const apiRoutes = {
  health: "/health",
  projects: "/projects",
  tasks: "/tasks",
  dashboard: {
    summary: "/dashboard/summary",
    insights: "/dashboard/insights",
  },
} as const;
