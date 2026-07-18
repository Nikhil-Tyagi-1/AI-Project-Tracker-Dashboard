"use client";

import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { ContentSkeleton, EmptyState, ErrorState } from "@/components/ui";
import {
  TASK_STATUS_VALUES,
  taskStatusLabels,
  type TaskStatus,
} from "@/constants/enums";
import { appRoutes } from "@/constants/routes";
import type { TaskStatusSummary } from "@/types/task";

export type ProjectTaskSummarySectionProps = {
  projectId: string;
  summary: TaskStatusSummary | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenBoard: () => void;
};

function StatusCountRow({
  status,
  count,
  total,
}: {
  status: TaskStatus;
  count: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {taskStatusLabels[status]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {count}
          {total > 0 ? ` · ${percent}%` : null}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percent}
        aria-label={`${taskStatusLabels[status]}: ${count} of ${total}`}
        sx={{ height: 6, borderRadius: 1 }}
      />
    </Stack>
  );
}

/**
 * Task counts by Kanban status with a link to the project board.
 */
export function ProjectTaskSummarySection({
  projectId,
  summary,
  loading,
  error,
  onRetry,
  onOpenBoard,
}: ProjectTaskSummarySectionProps) {
  return (
    <Box
      component="section"
      aria-labelledby="project-tasks-heading"
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          id="project-tasks-heading"
          component="h2"
          variant="h6"
          sx={{ fontWeight: 700 }}
        >
          Task summary
        </Typography>
        <Button
          component={Link}
          href={appRoutes.kanbanForProject(projectId)}
          variant="outlined"
          startIcon={<ViewKanbanOutlinedIcon />}
          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
        >
          Open Kanban board
        </Button>
      </Stack>

      {loading ? (
        <ContentSkeleton lines={5} aria-label="Loading task summary" />
      ) : null}

      {!loading && error ? (
        <ErrorState
          title="Could not load tasks"
          message={error}
          onRetry={onRetry}
          maxWidth={360}
        />
      ) : null}

      {!loading && !error && summary && summary.total === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="This project has no active tasks. Open the Kanban board to start tracking work."
          actionLabel="Open Kanban board"
          onAction={onOpenBoard}
          maxWidth={360}
        />
      ) : null}

      {!loading && !error && summary && summary.total > 0 ? (
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            <SummaryStat label="Total tasks" value={String(summary.total)} />
            <SummaryStat label="Open" value={String(summary.openCount)} />
            <SummaryStat label="Done" value={String(summary.doneCount)} />
          </Box>

          <Stack spacing={1.5}>
            {TASK_STATUS_VALUES.map((status) => (
              <StatusCountRow
                key={status}
                status={status}
                count={summary.byStatus[status]}
                total={summary.total}
              />
            ))}
          </Stack>
        </Stack>
      ) : null}
    </Box>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        px: 1.5,
        py: 1.25,
        bgcolor: "action.hover",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}
