/**
 * Application route paths for Next.js App Router navigation.
 */
export const appRoutes = {
  home: "/",
  dashboard: "/dashboard",
  projects: "/projects",
  projectCreate: "/projects/new",
  projectDetail: (id: string) => `/projects/${id}` as const,
  projectEdit: (id: string) => `/projects/${id}/edit` as const,
  kanban: "/kanban",
  /** Kanban scoped to a project (query consumed when board UI lands). */
  kanbanForProject: (projectId: string) =>
    `/kanban?projectId=${encodeURIComponent(projectId)}` as const,
  analytics: "/analytics",
  settings: "/settings",
} as const;
