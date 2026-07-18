"use client";

import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { EmptyState, ErrorState } from "@/components/ui";
import { appRoutes } from "@/constants/routes";
import { motionPresets } from "@/constants/motion";
import { ChartsGrid } from "@/features/dashboard/components/charts/ChartsGrid";
import { DashboardChartsSkeleton } from "@/features/dashboard/components/charts/DashboardChartsSkeleton";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchDashboardSummary,
  selectDashboardCharts,
  selectDashboardMetrics,
  selectDashboardSummaryError,
  selectDashboardSummaryStatus,
} from "@/store/slices/dashboardSlice";

/**
 * Analytics feature view — dedicated layout for the four portfolio charts.
 * Reuses the same chart components and `/dashboard/summary` data as Dashboard.
 */
export function AnalyticsView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const metrics = useAppSelector(selectDashboardMetrics);
  const charts = useAppSelector(selectDashboardCharts);
  const summaryStatus = useAppSelector(selectDashboardSummaryStatus);
  const summaryError = useAppSelector(selectDashboardSummaryError);

  useEffect(() => {
    void dispatch(fetchDashboardSummary());
  }, [dispatch]);

  const handleRetry = () => {
    void dispatch(fetchDashboardSummary());
  };

  const showSkeleton =
    summaryStatus === "loading" ||
    (summaryStatus === "idle" && charts === null);
  const showError = summaryStatus === "failed" && charts === null;
  const showCharts = summaryStatus === "succeeded" && charts !== null;
  const showEmpty =
    showCharts && metrics !== null && metrics.totalProjects === 0;

  return (
    <Box
      component="section"
      aria-labelledby="analytics-page-title"
      sx={{ width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "hidden" }}
    >
      <Stack spacing={3} sx={{ minWidth: 0 }}>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography
            id="analytics-page-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Deeper views of project progress, task status, workload, and
            monthly activity.
          </Typography>
        </Stack>

        {showSkeleton ? (
          <DashboardChartsSkeleton variant="expanded" />
        ) : null}

        {showError ? (
          <ErrorState
            title="Could not load analytics"
            message={
              summaryError ??
              "Something went wrong while loading portfolio charts."
            }
            onRetry={handleRetry}
          />
        ) : null}

        {showCharts && charts ? (
          <motion.div {...motionPresets.fadeUp}>
            <ChartsGrid
              charts={charts}
              variant="expanded"
              chartHeight={320}
            />
          </motion.div>
        ) : null}

        {showEmpty ? (
          <motion.div {...motionPresets.fadeUp}>
            <EmptyState
              icon={FolderOffOutlinedIcon}
              title="No analytics yet"
              description="Create projects and tasks to populate progress, status, workload, and activity charts."
              actionLabel="Create project"
              onAction={() => {
                router.push(appRoutes.projectCreate);
              }}
            />
          </motion.div>
        ) : null}
      </Stack>
    </Box>
  );
}
