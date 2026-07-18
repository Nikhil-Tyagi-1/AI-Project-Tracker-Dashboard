"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

import { Skeleton } from "@/components/ui";
import { DASHBOARD_METRIC_DEFINITIONS } from "@/features/dashboard/metricDefinitions";

/**
 * Loading placeholder that mirrors the metrics card grid layout.
 */
export function DashboardMetricsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading dashboard metrics"
    >
      <Grid container spacing={2} aria-hidden>
        {DASHBOARD_METRIC_DEFINITIONS.map((definition) => (
          <Grid key={definition.key} size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            >
              <Skeleton variant="rectangular" height={4} width="100%" />
              <Stack spacing={1.25} sx={{ p: 2 }}>
                <Skeleton variant="text" width="55%" height={20} />
                <Skeleton variant="text" width="40%" height={36} />
                <Skeleton variant="text" width="70%" height={16} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
