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
  analytics: "/analytics",
  settings: "/settings",
} as const;
