"use client";

import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { InsightCard } from "@/features/dashboard/components/InsightCard";
import type { RequestStatus } from "@/store/slices/projectsSlice";
import type { DashboardInsight } from "@/types/dashboard";
import { formatDisplayDate } from "@/utils/formatDate";

export type SmartInsightsPanelProps = {
  insights: DashboardInsight[];
  generatedAt: string | null;
  status: RequestStatus;
  error: string | null;
  onRetry: () => void;
};

function InsightsSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading smart insights"
    >
      <Grid container spacing={2} aria-hidden>
        {Array.from({ length: 3 }, (_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 12 }}>
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                p: 2,
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1}>
                  <Skeleton variant="rounded" width={72} height={24} />
                  <Skeleton variant="rounded" width={80} height={24} />
                </Stack>
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="100%" height={18} />
                <Skeleton variant="text" width="90%" height={18} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/**
 * Smart Insights section — independent of summary charts so failures stay local.
 */
export function SmartInsightsPanel({
  insights,
  generatedAt,
  status,
  error,
  onRetry,
}: SmartInsightsPanelProps) {
  const showSkeleton = status === "loading" || status === "idle";
  const showError = status === "failed";
  const showEmpty = status === "succeeded" && insights.length === 0;
  const showCards = status === "succeeded" && insights.length > 0;

  return (
    <Box
      component="section"
      aria-labelledby="smart-insights-heading"
      sx={{
        height: "100%",
        minWidth: 0,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        boxShadow: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={0.5} sx={{ px: 2, pt: 2, pb: 1.5, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <AutoAwesomeOutlinedIcon
            aria-hidden
            sx={{ color: "primary.main", fontSize: 22 }}
          />
          <Typography
            id="smart-insights-heading"
            component="h2"
            variant="h6"
            sx={{ fontWeight: 650 }}
          >
            Smart Insights
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Mock recommendations derived from your current portfolio — not live AI.
        </Typography>
        {generatedAt && status === "succeeded" ? (
          <Typography variant="caption" color="text.secondary">
            Generated {formatDisplayDate(generatedAt, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Typography>
        ) : null}
      </Stack>

      <Box sx={{ px: 2, pb: 2, flex: 1, minWidth: 0 }}>
        {showSkeleton ? <InsightsSkeleton /> : null}

        {showError ? (
          <ErrorState
            title="Could not load insights"
            message={
              error ?? "Something went wrong while loading Smart Insights."
            }
            onRetry={onRetry}
            maxWidth={360}
          />
        ) : null}

        {showEmpty ? (
          <EmptyState
            title="No insights right now"
            description="Your portfolio looks healthy — check back as projects and tasks change."
            maxWidth={360}
          />
        ) : null}

        {showCards ? (
          <Grid container spacing={2}>
            {insights.map((insight) => (
              <Grid key={insight.id} size={{ xs: 12, sm: 6, lg: 12 }}>
                <InsightCard insight={insight} />
              </Grid>
            ))}
          </Grid>
        ) : null}
      </Box>
    </Box>
  );
}
