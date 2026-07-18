import type {
  ChartDataPoint,
  DashboardCharts,
  MonthlyActivityPoint,
} from "@/types/dashboard";

/** True when a label/value series has no points or only zeros. */
export function isValueSeriesEmpty(data: ChartDataPoint[]): boolean {
  return data.length === 0 || data.every((point) => point.value === 0);
}

/** True when monthly activity has no creates or updates across the window. */
export function isMonthlyActivityEmpty(
  data: MonthlyActivityPoint[],
): boolean {
  return (
    data.length === 0 ||
    data.every((point) => point.created === 0 && point.updated === 0)
  );
}

export function isProjectProgressEmpty(charts: DashboardCharts): boolean {
  return isValueSeriesEmpty(charts.projectProgress);
}

export function isTaskStatusEmpty(charts: DashboardCharts): boolean {
  return isValueSeriesEmpty(charts.taskStatusDistribution);
}

export function isTeamWorkloadEmpty(charts: DashboardCharts): boolean {
  return isValueSeriesEmpty(charts.teamWorkload);
}

export function isMonthlyActivitySeriesEmpty(
  charts: DashboardCharts,
): boolean {
  return isMonthlyActivityEmpty(charts.monthlyActivity);
}

/** Truncate long axis labels so charts stay readable on narrow viewports. */
export function truncateChartLabel(label: string, maxLength = 18): string {
  if (label.length <= maxLength) {
    return label;
  }
  return `${label.slice(0, maxLength - 1)}…`;
}

/** Format `YYYY-MM` activity labels as short month tokens (e.g. `Jul`). */
export function formatMonthLabel(label: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(label);
  if (!match) {
    return label;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || month < 1 || month > 12) {
    return label;
  }
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}
