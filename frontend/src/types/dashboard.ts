/**
 * Dashboard domain types aligned with docs/api/dashboard.md and the backend
 * DashboardSummary / DashboardInsights response shapes.
 */

/** Single { label, value } point used by bar and pie charts. */
export type ChartDataPoint = {
  label: string;
  value: number;
};

/** Monthly activity point — two series for a multi-line chart. */
export type MonthlyActivityPoint = {
  label: string;
  created: number;
  updated: number;
};

export type DashboardMetrics = {
  totalProjects: number;
  /** Non-archived projects with status IN_PROGRESS. */
  activeProjects: number;
  completedProjects: number;
  atRiskProjects: number;
  totalTasks: number;
  /** Tasks with status DONE. */
  completedTasks: number;
  /** Tasks not yet DONE (TODO | IN_PROGRESS | IN_REVIEW). */
  pendingTasks: number;
  /** Round((completedTasks / totalTasks) * 100); 0 when there are no tasks. */
  completionPercentage: number;
};

export type DashboardCharts = {
  /** Bar: project name → progress (0–100). */
  projectProgress: ChartDataPoint[];
  /** Pie: task status → count (all four statuses always present). */
  taskStatusDistribution: ChartDataPoint[];
  /** Bar: assignee display name → task count (includes Unassigned). */
  teamWorkload: ChartDataPoint[];
  /** Line: last N months of create / update activity. */
  monthlyActivity: MonthlyActivityPoint[];
};

/** Payload from GET /api/dashboard/summary. */
export type DashboardSummary = {
  metrics: DashboardMetrics;
  charts: DashboardCharts;
};

export type InsightSeverity = "info" | "warning" | "critical";

export type InsightCategory =
  | "risk"
  | "workload"
  | "progress"
  | "deadline"
  | "portfolio";

export type DashboardInsight = {
  id: string;
  severity: InsightSeverity;
  title: string;
  message: string;
  category: InsightCategory;
};

/** Payload from GET /api/dashboard/insights. */
export type DashboardInsights = {
  insights: DashboardInsight[];
  generatedAt: string;
};

/** Derived recent-activity feed item (no dedicated activity API in MVP). */
export type ActivityEntityType = "project" | "task";

export type ActivityAction = "created" | "updated";

export type ActivityItem = {
  id: string;
  entityType: ActivityEntityType;
  action: ActivityAction;
  title: string;
  /** Supporting context (e.g. project name, owner). */
  subtitle?: string;
  /** Optional deep link into the app. */
  href?: string;
  occurredAt: string;
};
