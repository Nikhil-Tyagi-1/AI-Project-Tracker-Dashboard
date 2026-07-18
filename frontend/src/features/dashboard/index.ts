export { DashboardView } from "@/features/dashboard/DashboardView";
export { AnalyticsView } from "@/features/dashboard/AnalyticsView";
export { MetricCard } from "@/features/dashboard/components/MetricCard";
export { MetricsGrid } from "@/features/dashboard/components/MetricsGrid";
export { DashboardMetricsSkeleton } from "@/features/dashboard/components/DashboardMetricsSkeleton";
export { ChartPanel } from "@/features/dashboard/components/charts/ChartPanel";
export { ChartsGrid } from "@/features/dashboard/components/charts/ChartsGrid";
export { DashboardChartsSkeleton } from "@/features/dashboard/components/charts/DashboardChartsSkeleton";
export { ProjectProgressChart } from "@/features/dashboard/components/charts/ProjectProgressChart";
export { TaskStatusChart } from "@/features/dashboard/components/charts/TaskStatusChart";
export { TeamWorkloadChart } from "@/features/dashboard/components/charts/TeamWorkloadChart";
export { MonthlyActivityChart } from "@/features/dashboard/components/charts/MonthlyActivityChart";
export { InsightCard } from "@/features/dashboard/components/InsightCard";
export { SmartInsightsPanel } from "@/features/dashboard/components/SmartInsightsPanel";
export { RecentActivitySection } from "@/features/dashboard/components/RecentActivitySection";
export { deriveRecentActivity } from "@/features/dashboard/deriveRecentActivity";
export {
  DASHBOARD_METRIC_DEFINITIONS,
  formatMetricValue,
} from "@/features/dashboard/metricDefinitions";
export type {
  MetricDefinition,
  MetricKey,
} from "@/features/dashboard/metricDefinitions";
export {
  formatMonthLabel,
  isMonthlyActivityEmpty,
  isValueSeriesEmpty,
  truncateChartLabel,
} from "@/features/dashboard/chartUtils";
