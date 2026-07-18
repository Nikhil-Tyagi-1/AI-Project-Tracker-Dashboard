"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { Skeleton } from "@/components/ui";

/**
 * Loading placeholder that mirrors table (desktop) and card (mobile) layouts.
 */
export function ProjectsListSkeleton() {
  const theme = useTheme();
  const isTableLayout = useMediaQuery(theme.breakpoints.up("md"));

  if (isTableLayout) {
    return (
      <Box
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading projects"
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Stack spacing={0} aria-hidden>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
              gap: 2,
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} variant="text" height={22} />
            ))}
          </Box>
          {Array.from({ length: 6 }, (_, row) => (
            <Box
              key={row}
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                gap: 2,
                px: 2,
                py: 2,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              {Array.from({ length: 6 }, (_, col) => (
                <Skeleton key={col} variant="text" height={24} />
              ))}
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading projects"
    >
      <Stack spacing={1.5} aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <Box
            key={index}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
              p: 2,
            }}
          >
            <Stack spacing={1.5}>
              <Skeleton variant="text" width="70%" height={28} />
              <Skeleton variant="text" width="40%" height={20} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={72} height={24} />
                <Skeleton variant="rounded" width={64} height={24} />
              </Stack>
              <Skeleton variant="rounded" width="100%" height={8} />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
