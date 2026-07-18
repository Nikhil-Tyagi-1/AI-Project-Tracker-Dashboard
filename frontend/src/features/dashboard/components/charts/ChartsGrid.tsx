"use client";

import Grid from "@mui/material/Grid";

import { MonthlyActivityChart } from "@/features/dashboard/components/charts/MonthlyActivityChart";
import { ProjectProgressChart } from "@/features/dashboard/components/charts/ProjectProgressChart";
import { TaskStatusChart } from "@/features/dashboard/components/charts/TaskStatusChart";
import { TeamWorkloadChart } from "@/features/dashboard/components/charts/TeamWorkloadChart";
import type { DashboardCharts } from "@/types/dashboard";

export type ChartsGridProps = {
  charts: DashboardCharts;
  /**
   * `compact` — 2×2 on desktop (Dashboard).
   * `expanded` — progress/workload full-width rows on large screens (Analytics).
   */
  variant?: "compact" | "expanded";
  /** Optional shared plot height override. */
  chartHeight?: number;
};

/**
 * Responsive grid of the four portfolio charts.
 * Prevents horizontal overflow via `minWidth: 0` on grid items.
 */
export function ChartsGrid({
  charts,
  variant = "compact",
  chartHeight,
}: ChartsGridProps) {
  const progressSize =
    variant === "expanded"
      ? ({ xs: 12, md: 12, lg: 7 } as const)
      : ({ xs: 12, md: 6 } as const);
  const statusSize =
    variant === "expanded"
      ? ({ xs: 12, md: 6, lg: 5 } as const)
      : ({ xs: 12, md: 6 } as const);
  const workloadSize =
    variant === "expanded"
      ? ({ xs: 12, md: 6, lg: 5 } as const)
      : ({ xs: 12, md: 6 } as const);
  const activitySize =
    variant === "expanded"
      ? ({ xs: 12, md: 12, lg: 7 } as const)
      : ({ xs: 12, md: 6 } as const);

  return (
    <Grid
      container
      spacing={2}
      component="section"
      aria-label="Portfolio charts"
      sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
    >
      <Grid size={progressSize} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <ProjectProgressChart
          data={charts.projectProgress}
          height={chartHeight}
        />
      </Grid>
      <Grid size={statusSize} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <TaskStatusChart
          data={charts.taskStatusDistribution}
          height={chartHeight}
        />
      </Grid>
      <Grid size={workloadSize} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <TeamWorkloadChart
          data={charts.teamWorkload}
          height={chartHeight}
        />
      </Grid>
      <Grid size={activitySize} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <MonthlyActivityChart
          data={charts.monthlyActivity}
          height={chartHeight}
        />
      </Grid>
    </Grid>
  );
}
