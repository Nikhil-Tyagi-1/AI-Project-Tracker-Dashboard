"use client";

import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ProjectPriorityChip } from "@/features/projects/components/ProjectPriorityChip";
import type { Task } from "@/types/task";
import { formatDisplayDate } from "@/utils/formatDate";

export type TaskCardProps = {
  task: Task;
};

/**
 * Kanban task card — title, priority, assignee, and due date.
 * Drag-and-drop and status controls land in a later Milestone 7 step.
 */
export function TaskCard({ task }: TaskCardProps) {
  const assigneeLabel = task.assignee?.name ?? "Unassigned";
  const dueDateLabel = formatDisplayDate(task.dueDate);

  return (
    <Box
      component="article"
      aria-label={`Task: ${task.title}`}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        p: 1.5,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: 1,
        },
      }}
    >
      <Stack spacing={1.25}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {task.title}
        </Typography>

        <ProjectPriorityChip priority={task.priority} size="small" />

        <Stack spacing={0.75}>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <PersonOutlineOutlinedIcon
              fontSize="small"
              color="action"
              aria-hidden
              sx={{ flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              title={assigneeLabel}
            >
              {assigneeLabel}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <EventOutlinedIcon
              fontSize="small"
              color="action"
              aria-hidden
              sx={{ flexShrink: 0 }}
            />
            <Typography variant="caption" color="text.secondary">
              {dueDateLabel}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
