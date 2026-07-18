"use client" 
import { arrayMove } from "@dnd-kit/sortable";

import { TASK_STATUS_VALUES, type TaskStatus } from "@/constants/enums";
import { groupTasksByStatus } from "@/features/tasks/groupTasksByStatus";
import type { Task } from "@/types/task";

export type TaskMoveRequest = {
  tasks: Task[];
  taskId: string;
  toStatus: TaskStatus;
  /** Target index within the destination column (0-based). */
  toIndex: number;
};

export type TaskMoveResult = {
  previousTasks: Task[];
  nextTasks: Task[];
  updatedTask: Task;
  patch: {
    status: TaskStatus;
    sortOrder: number;
  };
};

function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUS_VALUES as readonly string[]).includes(value);
}

function reindexColumn(column: Task[], status: TaskStatus): Task[] {
  return column.map((item, index) => ({
    ...item,
    status,
    sortOrder: index,
  }));
}

/**
 * Resolve which Kanban column owns a dnd-kit id (column status or task id).
 */
export function findTaskContainer(
  tasks: Task[],
  id: string,
): TaskStatus | undefined {
  if (isTaskStatus(id)) {
    return id;
  }

  return tasks.find((task) => task.id === id)?.status;
}

/**
 * Compute the next board state after moving a task to a column index.
 * Reindexes `sortOrder` in the affected column(s) for stable UI ordering.
 * Returns `null` when the move is a no-op or the task is missing.
 */
export function computeTaskMove({
  tasks,
  taskId,
  toStatus,
  toIndex,
}: TaskMoveRequest): TaskMoveResult | null {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) {
    return null;
  }

  const byStatus = groupTasksByStatus(tasks);
  const fromStatus = task.status;
  const fromIndex = byStatus[fromStatus].findIndex((item) => item.id === taskId);

  if (fromIndex < 0) {
    return null;
  }

  const nextByStatus = { ...byStatus };

  if (fromStatus === toStatus) {
    const column = byStatus[fromStatus];
    const clampedTo = Math.max(0, Math.min(toIndex, column.length - 1));

    if (clampedTo === fromIndex) {
      return null;
    }

    nextByStatus[toStatus] = reindexColumn(
      arrayMove(column, fromIndex, clampedTo),
      toStatus,
    );
  } else {
    const sourceWithoutTask = byStatus[fromStatus].filter(
      (item) => item.id !== taskId,
    );
    const targetColumn = [...byStatus[toStatus]];
    const insertIndex = Math.max(
      0,
      Math.min(toIndex, targetColumn.length),
    );
    const movedTask: Task = {
      ...task,
      status: toStatus,
      sortOrder: insertIndex,
    };
    targetColumn.splice(insertIndex, 0, movedTask);

    nextByStatus[fromStatus] = reindexColumn(sourceWithoutTask, fromStatus);
    nextByStatus[toStatus] = reindexColumn(targetColumn, toStatus);
  }

  const updatedTask = nextByStatus[toStatus].find((item) => item.id === taskId);
  if (!updatedTask) {
    return null;
  }

  if (
    updatedTask.status === task.status &&
    updatedTask.sortOrder === task.sortOrder
  ) {
    return null;
  }

  return {
    previousTasks: tasks,
    nextTasks: TASK_STATUS_VALUES.flatMap((status) => nextByStatus[status]),
    updatedTask,
    patch: {
      status: updatedTask.status,
      sortOrder: updatedTask.sortOrder,
    },
  };
}

/**
 * Move a task to the end of a status column (used by the accessible status menu).
 */
export function computeTaskStatusChange(
  tasks: Task[],
  taskId: string,
  toStatus: TaskStatus,
): TaskMoveResult | null {
  const task = tasks.find((item) => item.id === taskId);
  if (!task || task.status === toStatus) {
    return null;
  }

  const byStatus = groupTasksByStatus(tasks);
  return computeTaskMove({
    tasks,
    taskId,
    toStatus,
    toIndex: byStatus[toStatus].length,
  });
}
