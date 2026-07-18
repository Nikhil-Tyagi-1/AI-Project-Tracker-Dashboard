"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

import { TASK_STATUS_VALUES, type TaskStatus } from "@/constants/enums";
import { KanbanColumn } from "@/features/tasks/components/KanbanColumn";
import { groupTasksByStatus } from "@/features/tasks/groupTasksByStatus";
import { findTaskContainer } from "@/features/tasks/moveTask";
import type { Task } from "@/types/task";

export type KanbanBoardProps = {
  tasks: Task[];
  onMoveTask: (
    taskId: string,
    toStatus: TaskStatus,
    toIndex: number,
  ) => void | Promise<boolean>;
  onStatusChange: (
    taskId: string,
    status: TaskStatus,
  ) => void | Promise<boolean>;
  onEditTask: (task: Task) => void;
  onArchiveTask: (task: Task) => void;
  onRestoreTask: (task: Task) => void;
  disabled?: boolean;
};

/**
 * Drag-and-drop Kanban board shell (columns + overlay).
 * Persistence / optimistic updates are handled by the parent via callbacks.
 */
export function KanbanBoard({
  tasks,
  onMoveTask,
  onStatusChange,
  onEditTask,
  onArchiveTask,
  onRestoreTask,
  disabled = false,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const tasksByStatus = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeId) ?? null,
    [activeId, tasks],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const resolveTarget = (
    overId: UniqueIdentifier,
  ): { status: TaskStatus; index: number } | null => {
    const overKey = String(overId);
    const overContainer = findTaskContainer(tasks, overKey);
    if (!overContainer) {
      return null;
    }

    const columnTasks = tasksByStatus[overContainer];

    if (overKey === overContainer) {
      return { status: overContainer, index: columnTasks.length };
    }

    const overIndex = columnTasks.findIndex((task) => task.id === overKey);
    if (overIndex < 0) {
      return { status: overContainer, index: columnTasks.length };
    }

    return { status: overContainer, index: overIndex };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || disabled) {
      return;
    }

    const taskId = String(active.id);
    const fromStatus = findTaskContainer(tasks, taskId);
    const target = resolveTarget(over.id);

    if (!fromStatus || !target) {
      return;
    }

    if (taskId === String(over.id)) {
      return;
    }

    void onMoveTask(taskId, target.status, target.index);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box
        role="region"
        aria-label="Kanban columns"
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 2,
          overflowX: "auto",
          pb: 1,
          mx: { xs: -2, sm: -3 },
          px: { xs: 2, sm: 3 },
          WebkitOverflowScrolling: "touch",
          scrollSnapType: { xs: "x mandatory", md: "none" },
        }}
      >
        {TASK_STATUS_VALUES.map((status) => (
          <Box
            key={status}
            sx={{
              display: "flex",
              scrollSnapAlign: { xs: "start", md: "none" },
            }}
          >
            <KanbanColumn
              status={status}
              tasks={tasksByStatus[status]}
              onStatusChange={(taskId, nextStatus) => {
                void onStatusChange(taskId, nextStatus);
              }}
              onEditTask={onEditTask}
              onArchiveTask={onArchiveTask}
              onRestoreTask={onRestoreTask}
              disabled={disabled}
            />
          </Box>
        ))}
      </Box>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <Box sx={{ width: { xs: 260, sm: 280 }, cursor: "grabbing" }}>
            <Stack
              spacing={1.25}
              sx={{
                border: 1,
                borderColor: "primary.main",
                borderRadius: 1,
                bgcolor: "background.paper",
                p: 1.5,
                boxShadow: 6,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {activeTask.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Moving…
              </Typography>
            </Stack>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
