"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { Skeleton } from "@/components/ui";
import { TASK_STATUS_VALUES } from "@/constants/enums";

/**
 * Loading placeholder that mirrors the four-column Kanban board layout.
 */
export function KanbanBoardSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading Kanban board"
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        pb: 1,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {TASK_STATUS_VALUES.map((status) => (
        <Box
          key={status}
          aria-hidden
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 0",
            minWidth: { xs: 260, sm: 280 },
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "action.hover",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Skeleton variant="text" width={96} height={24} />
              <Skeleton variant="rounded" width={28} height={20} />
            </Stack>
          </Box>

          <Stack spacing={1.25} sx={{ p: 1.25 }}>
            {Array.from({ length: 3 }, (_, index) => (
              <Box
                key={index}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  p: 1.5,
                }}
              >
                <Stack spacing={1.25}>
                  <Skeleton variant="text" width="85%" height={22} />
                  <Skeleton variant="rounded" width={72} height={24} />
                  <Skeleton variant="text" width="55%" height={18} />
                  <Skeleton variant="text" width="40%" height={18} />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
