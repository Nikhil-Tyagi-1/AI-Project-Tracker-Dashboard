import type { Task } from "@/types/task";
import type { TaskStatus } from "@/constants/enums";
import { getApiErrorMessage } from "@/utils/apiError";

export type PersistTaskMoveParams = {
  previousTasks: Task[];
  nextTasks: Task[];
  taskId: string;
  patch: {
    status: TaskStatus;
    sortOrder: number;
  };
  applyOptimistic: (tasks: Task[]) => void;
  persist: (
    id: string,
    input: { status: TaskStatus; sortOrder: number },
  ) => Promise<Task>;
  applyServerTask: (task: Task) => void;
  rollback: (tasks: Task[]) => void;
  onError: (message: string) => void;
};

/**
 * Apply an optimistic board move, persist via API, and roll back on failure.
 * Extracted for unit testing of the success/failure paths.
 */
export async function persistTaskMove({
  previousTasks,
  nextTasks,
  taskId,
  patch,
  applyOptimistic,
  persist,
  applyServerTask,
  rollback,
  onError,
}: PersistTaskMoveParams): Promise<boolean> {
  applyOptimistic(nextTasks);

  try {
    const saved = await persist(taskId, patch);
    applyServerTask(saved);
    return true;
  } catch (error) {
    rollback(previousTasks);
    onError(getApiErrorMessage(error, "Failed to update task status"));
    return false;
  }
}
