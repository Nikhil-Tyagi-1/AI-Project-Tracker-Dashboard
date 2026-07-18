"use client";

import Grid from "@mui/material/Grid";

import { MetricCard } from "@/features/dashboard/components/MetricCard";
import {
  DASHBOARD_METRIC_DEFINITIONS,
  formatMetricValue,
  type MetricDefinition,
} from "@/features/dashboard/metricDefinitions";
import type { DashboardMetrics } from "@/types/dashboard";

export type MetricsGridProps = {
  metrics: DashboardMetrics;
  /** Override which metrics to render; defaults to the full dashboard set. */
  definitions?: MetricDefinition[];
};

/**
 * Responsive MUI Grid of reusable metric cards.
 * Desktop: 4 columns · tablet: 2 · mobile: 1.
 */
export function MetricsGrid({
  metrics,
  definitions = DASHBOARD_METRIC_DEFINITIONS,
}: MetricsGridProps) {
  return (
    <Grid
      container
      spacing={2}
      component="section"
      aria-label="Portfolio metrics"
    >
      {definitions.map((definition) => (
        <Grid
          key={definition.key}
          size={{ xs: 12, sm: 6, md: 3 }}
        >
          <MetricCard
            label={definition.label}
            value={formatMetricValue(
              metrics[definition.key],
              definition.format,
            )}
            description={definition.description}
            accent={definition.accent}
          />
        </Grid>
      ))}
    </Grid>
  );
}
