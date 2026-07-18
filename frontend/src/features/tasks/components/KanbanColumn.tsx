"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { taskStatusLabels, type TaskStatus } from "@/constants/enums";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { colorTokens } from "@/theme/tokens";
import type { Task } from "@/types/task";

const columnAccent: Record<TaskStatus, string> = {
  TODO: colorTokens.status.todo,
  IN_PROGRESS: colorTokens.status.inProgress,
  IN_REVIEW: colorTokens.status.inReview,
  DONE: colorTokens.status.done,
};

export type KanbanColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onArchiveTask: (task: Task) => void;
  onRestoreTask: (task: Task) => void;
  disabled?: boolean;
};

/**
 * Droppable Kanban status column with sortable task cards.
 */
export function KanbanColumn({
  status,
  tasks,
  onStatusChange,
  onEditTask,
  onArchiveTask,
  onRestoreTask,
  disabled = false,
}: KanbanColumnProps) {
  const label = taskStatusLabels[status];
  const accent = columnAccent[status];
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
    disabled,
  });

  return (
    <Box
      component="section"
      aria-labelledby={`kanban-column-${status}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0",
        minWidth: { xs: 260, sm: 280 },
        maxWidth: { xs: 300, md: "none" },
        border: 1,
        borderColor: isOver ? "primary.main" : "divider",
        borderRadius: 1,
        bgcolor: isOver ? "action.selected" : "action.hover",
        overflow: "hidden",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          borderTop: 3,
          borderTopColor: accent,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography
            id={`kanban-column-${status}`}
            component="h2"
            variant="subtitle2"
            sx={{ fontWeight: 700 }}
          >
            {label}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            aria-label={`${tasks.length} tasks`}
            sx={{
              fontWeight: 600,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "action.selected",
            }}
          >
            {tasks.length}
          </Typography>
        </Stack>
      </Box>

      <SortableContext
        id={status}
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack
          ref={setNodeRef}
          spacing={1.25}
          component="ul"
          aria-label={`${label} tasks`}
          sx={{
            listStyle: "none",
            m: 0,
            p: 1.25,
            flex: 1,
            minHeight: 120,
            overflowY: "auto",
          }}
        >
          {tasks.length === 0 ? (
            <Box
              component="li"
              sx={{
                py: 3,
                px: 1,
                textAlign: "center",
                border: "1px dashed",
                borderColor: isOver ? "primary.main" : "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {isOver ? "Drop here" : "No tasks"}
              </Typography>
            </Box>
          ) : (
            tasks.map((task) => (
              <Box key={task.id} component="li" sx={{ m: 0, p: 0 }}>
                <TaskCard
                  task={task}
                  onStatusChange={onStatusChange}
                  onEdit={onEditTask}
                  onArchive={onArchiveTask}
                  onRestore={onRestoreTask}
                  disabled={disabled}
                />
              </Box>
            ))
          )}
        </Stack>
      </SortableContext>
    </Box>
  );
}
