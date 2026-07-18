import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Suspense } from "react";

import { KanbanBoardView } from "@/features/tasks";
import { KanbanBoardSkeleton } from "@/features/tasks/components/KanbanBoardSkeleton";

export const metadata: Metadata = {
  title: "Kanban",
};

function KanbanPageFallback() {
  return (
    <Box component="section" aria-busy="true" aria-label="Loading Kanban">
      <Stack spacing={3}>
        <Stack spacing={0.75}>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Kanban
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Loading board…
          </Typography>
        </Stack>
        <KanbanBoardSkeleton />
      </Stack>
    </Box>
  );
}

/**
 * Kanban route — project-scoped task board by status columns.
 */
export default function KanbanPage() {
  return (
    <Suspense fallback={<KanbanPageFallback />}>
      <KanbanBoardView />
    </Suspense>
  );
}
