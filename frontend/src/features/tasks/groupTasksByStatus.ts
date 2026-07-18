import { TASK_STATUS_VALUES, type TaskStatus } from "@/constants/enums";
import type { Task } from "@/types/task";

export type TasksByStatus = Record<TaskStatus, Task[]>;

/**
 * Group tasks into Kanban columns by status, preserving relative order within each column.
 * Column keys follow the left-to-right board order from `TASK_STATUS_VALUES`.
 */
export function groupTasksByStatus(tasks: Task[]): TasksByStatus {
  const grouped = Object.fromEntries(
    TASK_STATUS_VALUES.map((status) => [status, [] as Task[]]),
  ) as TasksByStatus;

  for (const task of tasks) {
    grouped[task.status].push(task);
  }

  for (const status of TASK_STATUS_VALUES) {
    grouped[status].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.title.localeCompare(b.title);
    });
  }

  return grouped;
}
