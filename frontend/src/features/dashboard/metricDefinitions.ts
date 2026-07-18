import type { DashboardMetrics } from "@/types/dashboard";

/**
 * Metric card definitions for the Dashboard summary grid.
 * Kept as config so Analytics (and tests) can reuse the same labels/keys.
 */
export type MetricKey = keyof DashboardMetrics;

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  /** Optional short hint shown under the value. */
  description?: string;
  /** How to format the numeric value for display. */
  format?: "number" | "percent";
  /** Theme palette key for a subtle left accent. */
  accent?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
};

export const DASHBOARD_METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    key: "totalProjects",
    label: "Total Projects",
    description: "Non-archived projects",
    accent: "primary",
  },
  {
    key: "activeProjects",
    label: "Active Projects",
    description: "In progress",
    accent: "info",
  },
  {
    key: "completedProjects",
    label: "Completed Projects",
    accent: "success",
  },
  {
    key: "atRiskProjects",
    label: "At Risk Projects",
    accent: "warning",
  },
  {
    key: "totalTasks",
    label: "Total Tasks",
    description: "On active projects",
    accent: "secondary",
  },
  {
    key: "completedTasks",
    label: "Completed Tasks",
    description: "Marked done",
    accent: "success",
  },
  {
    key: "pendingTasks",
    label: "Pending Tasks",
    description: "Not yet done",
    accent: "info",
  },
  {
    key: "completionPercentage",
    label: "Completion Percentage",
    description: "Tasks completed",
    format: "percent",
    accent: "primary",
  },
];

export function formatMetricValue(
  value: number,
  format: MetricDefinition["format"] = "number",
): string {
  if (format === "percent") {
    return `${value}%`;
  }
  return new Intl.NumberFormat().format(value);
}
