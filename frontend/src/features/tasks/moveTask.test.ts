import { describe, expect, it } from "vitest";

import {
  computeTaskMove,
  computeTaskStatusChange,
  findTaskContainer,
} from "@/features/tasks/moveTask";
import type { Task } from "@/types/task";

function makeTask(
  overrides: Partial<Task> & Pick<Task, "id" | "status" | "sortOrder">,
): Task {
  return {
    title: `Task ${overrides.id}`,
    description: null,
    priority: "MEDIUM",
    dueDate: null,
    projectId: "proj-1",
    project: { id: "proj-1", name: "Demo", isArchived: false },
    assigneeId: null,
    assignee: null,
    isArchived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const board: Task[] = [
  makeTask({ id: "t1", status: "TODO", sortOrder: 0, title: "One" }),
  makeTask({ id: "t2", status: "TODO", sortOrder: 1, title: "Two" }),
  makeTask({ id: "t3", status: "IN_PROGRESS", sortOrder: 0, title: "Three" }),
];

describe("findTaskContainer", () => {
  it("resolves column ids and task ids", () => {
    expect(findTaskContainer(board, "TODO")).toBe("TODO");
    expect(findTaskContainer(board, "t3")).toBe("IN_PROGRESS");
    expect(findTaskContainer(board, "missing")).toBeUndefined();
  });
});

describe("computeTaskMove", () => {
  it("returns null for a no-op same-index move", () => {
    expect(
      computeTaskMove({
        tasks: board,
        taskId: "t1",
        toStatus: "TODO",
        toIndex: 0,
      }),
    ).toBeNull();
  });

  it("moves a task across columns and reindexes sortOrder", () => {
    const result = computeTaskMove({
      tasks: board,
      taskId: "t1",
      toStatus: "IN_PROGRESS",
      toIndex: 1,
    });

    expect(result).not.toBeNull();
    expect(result?.patch).toEqual({ status: "IN_PROGRESS", sortOrder: 1 });
    expect(result?.updatedTask.status).toBe("IN_PROGRESS");

    const todo = result!.nextTasks.filter((task) => task.status === "TODO");
    const inProgress = result!.nextTasks.filter(
      (task) => task.status === "IN_PROGRESS",
    );

    expect(todo.map((task) => task.id)).toEqual(["t2"]);
    expect(todo[0]?.sortOrder).toBe(0);
    expect(inProgress.map((task) => task.id)).toEqual(["t3", "t1"]);
    expect(inProgress.map((task) => task.sortOrder)).toEqual([0, 1]);
  });

  it("reorders within the same column", () => {
    const result = computeTaskMove({
      tasks: board,
      taskId: "t1",
      toStatus: "TODO",
      toIndex: 1,
    });

    expect(result).not.toBeNull();
    const todo = result!.nextTasks.filter((task) => task.status === "TODO");
    expect(todo.map((task) => task.id)).toEqual(["t2", "t1"]);
    expect(result?.patch.sortOrder).toBe(1);
  });

  it("preserves previousTasks for rollback", () => {
    const result = computeTaskMove({
      tasks: board,
      taskId: "t2",
      toStatus: "DONE",
      toIndex: 0,
    });

    expect(result?.previousTasks).toBe(board);
    expect(result?.nextTasks).not.toBe(board);
  });
});

describe("computeTaskStatusChange", () => {
  it("appends to the target column and ignores same status", () => {
    expect(computeTaskStatusChange(board, "t1", "TODO")).toBeNull();

    const result = computeTaskStatusChange(board, "t1", "DONE");
    expect(result?.patch).toEqual({ status: "DONE", sortOrder: 0 });
    expect(
      result?.nextTasks.filter((task) => task.status === "DONE").map((t) => t.id),
    ).toEqual(["t1"]);
  });
});
