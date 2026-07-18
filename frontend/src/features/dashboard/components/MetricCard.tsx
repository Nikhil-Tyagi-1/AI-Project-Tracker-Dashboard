"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export type MetricCardProps = {
  /** Metric label shown above the value. */
  label: string;
  /** Formatted display value (e.g. "12" or "37%"). */
  value: string;
  /** Optional supporting copy under the value. */
  description?: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Theme palette key for a subtle left accent bar. */
  accent?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
};

/**
 * Reusable summary metric card for Dashboard and Analytics widgets.
 */
export function MetricCard({
  label,
  value,
  description,
  icon,
  accent = "primary",
}: MetricCardProps) {
  return (
    <Box
      component="article"
      aria-label={`${label}: ${value}`}
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
      <Box
        aria-hidden
        sx={{
          height: 4,
          bgcolor: `${accent}.main`,
        }}
      />
      <Stack spacing={1} sx={{ p: 2, flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600, lineHeight: 1.3 }}
          >
            {label}
          </Typography>
          {icon ? (
            <Box
              sx={{
                color: `${accent}.main`,
                display: "inline-flex",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          ) : null}
        </Stack>

        <Typography
          component="p"
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            m: 0,
          }}
        >
          {value}
        </Typography>

        {description ? (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
