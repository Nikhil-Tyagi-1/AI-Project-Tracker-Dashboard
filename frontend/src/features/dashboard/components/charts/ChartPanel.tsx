"use client";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export type ChartPanelProps = {
  title: string;
  description?: string;
  /** Accessible name for the chart region. */
  "aria-label"?: string;
  /** When true, render the empty-state slot instead of children. */
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
  /** Chart plot area height in px. */
  height?: number;
};

/**
 * Shared chrome for Dashboard/Analytics chart widgets.
 * Enforces `minWidth: 0` and `overflow: hidden` to prevent page overflow.
 */
export function ChartPanel({
  title,
  description,
  "aria-label": ariaLabel,
  empty = false,
  emptyTitle = "No data yet",
  emptyDescription = "This chart will populate when matching records exist.",
  children,
  height = 280,
}: ChartPanelProps) {
  return (
    <Box
      component="section"
      aria-label={ariaLabel ?? title}
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: "100%",
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
      <Stack spacing={0.5} sx={{ px: 2, pt: 2, pb: 1, minWidth: 0 }}>
        <Typography
          component="h3"
          variant="subtitle1"
          sx={{ fontWeight: 650, lineHeight: 1.3 }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Stack>

      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          minHeight: height,
          px: 1,
          pb: 2,
          overflow: "hidden",
        }}
      >
        {empty ? (
          <Box
            role="status"
            aria-live="polite"
            sx={{
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
            }}
          >
            <Stack
              spacing={1}
              sx={{ alignItems: "center", textAlign: "center", maxWidth: 280 }}
            >
              <InboxOutlinedIcon
                aria-hidden
                sx={{ fontSize: 36, color: "text.secondary", opacity: 0.85 }}
              />
              <Typography
                component="h4"
                variant="subtitle2"
                sx={{ fontWeight: 650 }}
              >
                {emptyTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {emptyDescription}
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height,
              maxWidth: "100%",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
}
