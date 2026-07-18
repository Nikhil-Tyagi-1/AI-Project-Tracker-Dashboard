import { appRoutes } from "@/constants/routes";

/**
 * Primary side-navigation items for the application shell.
 * Icons are mapped in layout components so this module stays free of React nodes.
 */
export const mainNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: appRoutes.dashboard,
  },
  {
    id: "projects",
    label: "Projects",
    href: appRoutes.projects,
  },
  {
    id: "kanban",
    label: "Kanban",
    href: appRoutes.kanban,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: appRoutes.analytics,
  },
  {
    id: "settings",
    label: "Settings",
    href: appRoutes.settings,
  },
] as const;

export type MainNavItemId = (typeof mainNavItems)[number]["id"];
export type MainNavItem = (typeof mainNavItems)[number];

/**
 * Whether a nav href matches the current pathname (supports nested routes).
 * Dashboard also matches the root path while it redirects.
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === appRoutes.dashboard) {
    return pathname === href || pathname === appRoutes.home;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
