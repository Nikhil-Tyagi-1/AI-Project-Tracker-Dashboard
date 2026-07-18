"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  insightCategoryLabels,
  insightSeverityAccent,
  insightSeverityLabels,
} from "@/features/dashboard/insightPresentation";
import type { DashboardInsight } from "@/types/dashboard";

export type InsightCardProps = {
  insight: DashboardInsight;
};

/**
 * Single Smart Insight recommendation card.
 */
export function InsightCard({ insight }: InsightCardProps) {
  const accent = insightSeverityAccent(insight.severity);

  return (
    <Box
      component="article"
      aria-label={`${insight.title}. ${insightSeverityLabels[insight.severity]}`}
      sx={{
        height: "100%",
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
      <Box aria-hidden sx={{ height: 4, bgcolor: `${accent}.main` }} />
      <Stack spacing={1.25} sx={{ p: 2, flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap", gap: 0.75 }}
        >
          <Chip
            size="small"
            label={insightSeverityLabels[insight.severity]}
            color={accent}
            variant="outlined"
          />
          <Chip
            size="small"
            label={insightCategoryLabels[insight.category]}
            variant="outlined"
          />
        </Stack>

        <Typography
          component="h4"
          variant="subtitle1"
          sx={{ fontWeight: 650, lineHeight: 1.3 }}
        >
          {insight.title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {insight.message}
        </Typography>
      </Stack>
    </Box>
  );
}
