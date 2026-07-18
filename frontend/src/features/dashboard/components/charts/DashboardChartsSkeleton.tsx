"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

import { Skeleton } from "@/components/ui";

const CHART_SLOTS = [
  "project-progress",
  "task-status",
  "team-workload",
  "monthly-activity",
] as const;

/**
 * Loading placeholder that mirrors the charts grid layout.
 */
export function DashboardChartsSkeleton({
  variant = "compact",
}: {
  variant?: "compact" | "expanded";
}) {
  const half =
    variant === "expanded"
      ? ({ xs: 12, md: 6, lg: 6 } as const)
      : ({ xs: 12, md: 6 } as const);

  return (
    <Box
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading dashboard charts"
      sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
    >
      <Grid container spacing={2} aria-hidden>
        {CHART_SLOTS.map((slot) => (
          <Grid key={slot} size={half} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                overflow: "hidden",
                p: 2,
              }}
            >
              <Stack spacing={1.5}>
                <Skeleton variant="text" width="45%" height={24} />
                <Skeleton variant="text" width="70%" height={18} />
                <Skeleton variant="rounded" width="100%" height={220} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
