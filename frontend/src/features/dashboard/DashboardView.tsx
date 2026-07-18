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
import { DashboardMetricsSkeleton } from "@/features/dashboard/components/DashboardMetricsSkeleton";
import { MetricsGrid } from "@/features/dashboard/components/MetricsGrid";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchDashboardSummary,
  selectDashboardMetrics,
  selectDashboardSummaryError,
  selectDashboardSummaryStatus,
} from "@/store/slices/dashboardSlice";

/**
 * Dashboard feature view — portfolio metric cards from `/dashboard/summary`.
 * Charts, activity, and Smart Insights are added in follow-up work.
 */
export function DashboardView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const metrics = useAppSelector(selectDashboardMetrics);
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
    (summaryStatus === "idle" && metrics === null);
  const showError = summaryStatus === "failed" && metrics === null;
  const showMetrics = summaryStatus === "succeeded" && metrics !== null;
  const showEmpty =
    showMetrics && metrics !== null && metrics.totalProjects === 0;

  return (
    <Box component="section" aria-labelledby="dashboard-page-title">
      <Stack spacing={3}>
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
            Portfolio health at a glance — projects, tasks, and completion.
          </Typography>
        </Stack>

        {showSkeleton ? <DashboardMetricsSkeleton /> : null}

        {showError ? (
          <ErrorState
            title="Could not load dashboard"
            message={
              summaryError ??
              "Something went wrong while loading portfolio metrics."
            }
            onRetry={handleRetry}
          />
        ) : null}

        {showMetrics && metrics ? (
          <motion.div {...motionPresets.fadeUp}>
            <MetricsGrid metrics={metrics} />
          </motion.div>
        ) : null}

        {showEmpty ? (
          <motion.div {...motionPresets.fadeUp}>
            <EmptyState
              icon={FolderOffOutlinedIcon}
              title="No projects yet"
              description="Create your first project to populate dashboard metrics. Cards and charts will update as work lands."
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
