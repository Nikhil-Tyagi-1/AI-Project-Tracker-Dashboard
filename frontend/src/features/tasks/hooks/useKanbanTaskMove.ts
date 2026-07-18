"use client";

import { useCallback, useRef } from "react";

import { useToast } from "@/components/ui/toast/useToast";
import type { TaskStatus } from "@/constants/enums";
import {
  computeTaskMove,
  computeTaskStatusChange,
} from "@/features/tasks/moveTask";
import { persistTaskMove } from "@/features/tasks/persistTaskMove";
import { updateTask as updateTaskRequest } from "@/services/api/tasks";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  replaceTasks,
  selectTasks,
  upsertTaskLocal,
} from "@/store/slices/tasksSlice";

/**
 * Optimistic Kanban task moves with API persistence and failure rollback.
 */
export function useKanbanTaskMove() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const { showError } = useToast();
  const pendingIdsRef = useRef(new Set<string>());
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const runMove = useCallback(
    async (move: ReturnType<typeof computeTaskMove>) => {
      if (!move) {
        return false;
      }

      const { updatedTask } = move;
      if (pendingIdsRef.current.has(updatedTask.id)) {
        return false;
      }

      pendingIdsRef.current.add(updatedTask.id);

      try {
        return await persistTaskMove({
          previousTasks: move.previousTasks,
          nextTasks: move.nextTasks,
          taskId: updatedTask.id,
          patch: move.patch,
          applyOptimistic: (next) => {
            dispatch(replaceTasks(next));
          },
          persist: updateTaskRequest,
          applyServerTask: (saved) => {
            dispatch(upsertTaskLocal(saved));
          },
          rollback: (previous) => {
            dispatch(replaceTasks(previous));
          },
          onError: (message) => {
            showError(message);
          },
        });
      } finally {
        pendingIdsRef.current.delete(updatedTask.id);
      }
    },
    [dispatch, showError],
  );

  const moveTaskTo = useCallback(
    async (taskId: string, toStatus: TaskStatus, toIndex: number) => {
      const move = computeTaskMove({
        tasks: tasksRef.current,
        taskId,
        toStatus,
        toIndex,
      });
      return runMove(move);
    },
    [runMove],
  );

  const changeTaskStatus = useCallback(
    async (taskId: string, toStatus: TaskStatus) => {
      const move = computeTaskStatusChange(
        tasksRef.current,
        taskId,
        toStatus,
      );
      return runMove(move);
    },
    [runMove],
  );

  return {
    moveTaskTo,
    changeTaskStatus,
  };
}
