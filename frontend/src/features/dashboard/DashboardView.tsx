"use client";

import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
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
import { DashboardMetricsSkeleton } from "@/features/dashboard/components/DashboardMetricsSkeleton";
import { MetricsGrid } from "@/features/dashboard/components/MetricsGrid";
import { RecentActivitySection } from "@/features/dashboard/components/RecentActivitySection";
import { SmartInsightsPanel } from "@/features/dashboard/components/SmartInsightsPanel";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchDashboardActivity,
  fetchDashboardInsights,
  fetchDashboardSummary,
  selectDashboardActivity,
  selectDashboardActivityError,
  selectDashboardActivityStatus,
  selectDashboardCharts,
  selectDashboardInsights,
  selectDashboardInsightsError,
  selectDashboardInsightsStatus,
  selectDashboardMetrics,
  selectDashboardSummaryError,
  selectDashboardSummaryStatus,
} from "@/store/slices/dashboardSlice";

/**
 * Dashboard feature view — metrics, charts, Smart Insights, and recent activity.
 * Insights failures stay section-local so the rest of the page remains usable.
 */
export function DashboardView() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const metrics = useAppSelector(selectDashboardMetrics);
  const charts = useAppSelector(selectDashboardCharts);
  const summaryStatus = useAppSelector(selectDashboardSummaryStatus);
  const summaryError = useAppSelector(selectDashboardSummaryError);

  const insightsPayload = useAppSelector(selectDashboardInsights);
  const insightsStatus = useAppSelector(selectDashboardInsightsStatus);
  const insightsError = useAppSelector(selectDashboardInsightsError);

  const activity = useAppSelector(selectDashboardActivity);
  const activityStatus = useAppSelector(selectDashboardActivityStatus);
  const activityError = useAppSelector(selectDashboardActivityError);

  useEffect(() => {
    void dispatch(fetchDashboardSummary());
    void dispatch(fetchDashboardInsights());
    void dispatch(fetchDashboardActivity());
  }, [dispatch]);

  const handleRetrySummary = () => {
    void dispatch(fetchDashboardSummary());
  };

  const handleRetryInsights = () => {
    void dispatch(fetchDashboardInsights());
  };

  const handleRetryActivity = () => {
    void dispatch(fetchDashboardActivity());
  };

  const showSummarySkeleton =
    summaryStatus === "loading" ||
    (summaryStatus === "idle" && metrics === null);
  const showSummaryError = summaryStatus === "failed" && metrics === null;
  const showSummaryContent =
    summaryStatus === "succeeded" && metrics !== null;
  const showPortfolioEmpty =
    showSummaryContent && metrics !== null && metrics.totalProjects === 0;

  return (
    <Box
      component="section"
      aria-labelledby="dashboard-page-title"
      sx={{ width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "hidden" }}
    >
      <Stack spacing={3} sx={{ minWidth: 0 }}>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography
            id="dashboard-page-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Portfolio health at a glance — projects, tasks, insights, and
            recent activity.
          </Typography>
        </Stack>

        {showSummarySkeleton ? (
          <Stack spacing={3}>
            <DashboardMetricsSkeleton />
            <DashboardChartsSkeleton variant="compact" />
          </Stack>
        ) : null}

        {showSummaryError ? (
          <ErrorState
            title="Could not load dashboard"
            message={
              summaryError ??
              "Something went wrong while loading portfolio metrics."
            }
            onRetry={handleRetrySummary}
          />
        ) : null}

        {showSummaryContent && metrics ? (
          <motion.div {...motionPresets.fadeUp}>
            <Stack spacing={3} sx={{ minWidth: 0 }}>
              <MetricsGrid metrics={metrics} />
              {charts ? (
                <ChartsGrid charts={charts} variant="compact" />
              ) : null}
            </Stack>
          </motion.div>
        ) : null}

        {/* Insights + activity load independently of summary success/failure. */}
        <motion.div {...motionPresets.fadeUp}>
          <Grid container spacing={2} sx={{ width: "100%", minWidth: 0 }}>
            <Grid size={{ xs: 12, lg: 7 }} sx={{ minWidth: 0 }}>
              <SmartInsightsPanel
                insights={insightsPayload?.insights ?? []}
                generatedAt={insightsPayload?.generatedAt ?? null}
                status={insightsStatus}
                error={insightsError}
                onRetry={handleRetryInsights}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }} sx={{ minWidth: 0 }}>
              <RecentActivitySection
                items={activity}
                status={activityStatus}
                error={activityError}
                onRetry={handleRetryActivity}
              />
            </Grid>
          </Grid>
        </motion.div>

        {showPortfolioEmpty ? (
          <motion.div {...motionPresets.fadeUp}>
            <EmptyState
              icon={FolderOffOutlinedIcon}
              title="No projects yet"
              description="Create your first project to populate dashboard metrics and charts."
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
