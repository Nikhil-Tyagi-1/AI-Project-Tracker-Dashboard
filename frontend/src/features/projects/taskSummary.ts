import { TASK_STATUS_VALUES, type TaskStatus } from "@/constants/enums";
import type { Task, TaskStatusSummary } from "@/types/task";

export function summarizeTasksByStatus(tasks: Task[]): TaskStatusSummary {
  const byStatus = Object.fromEntries(
    TASK_STATUS_VALUES.map((status) => [status, 0]),
  ) as Record<TaskStatus, number>;

  for (const task of tasks) {
    byStatus[task.status] += 1;
  }

  const total = tasks.length;
  const doneCount = byStatus.DONE;
  const openCount = total - doneCount;

  return { total, byStatus, doneCount, openCount };
}
