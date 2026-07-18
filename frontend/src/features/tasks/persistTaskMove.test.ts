import { describe, expect, it, vi } from "vitest";

import { persistTaskMove } from "@/features/tasks/persistTaskMove";
import type { Task } from "@/types/task";

function makeTask(id: string, status: Task["status"] = "TODO"): Task {
  return {
    id,
    title: `Task ${id}`,
    description: null,
    status,
    priority: "MEDIUM",
    dueDate: null,
    sortOrder: 0,
    projectId: "proj-1",
    project: { id: "proj-1", name: "Demo", isArchived: false },
    assigneeId: null,
    assignee: null,
    isArchived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("persistTaskMove", () => {
  it("applies optimistic state and syncs the server task on success", async () => {
    const previous = [makeTask("t1", "TODO")];
    const next = [makeTask("t1", "DONE")];
    const saved = { ...next[0]!, updatedAt: "2026-07-18T00:00:00.000Z" };

    const applyOptimistic = vi.fn();
    const applyServerTask = vi.fn();
    const rollback = vi.fn();
    const onError = vi.fn();
    const persist = vi.fn().mockResolvedValue(saved);

    const ok = await persistTaskMove({
      previousTasks: previous,
      nextTasks: next,
      taskId: "t1",
      patch: { status: "DONE", sortOrder: 0 },
      applyOptimistic,
      persist,
      applyServerTask,
      rollback,
      onError,
    });

    expect(ok).toBe(true);
    expect(applyOptimistic).toHaveBeenCalledWith(next);
    expect(persist).toHaveBeenCalledWith("t1", {
      status: "DONE",
      sortOrder: 0,
    });
    expect(applyServerTask).toHaveBeenCalledWith(saved);
    expect(rollback).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("rolls back and reports an error when persistence fails", async () => {
    const previous = [makeTask("t1", "TODO")];
    const next = [makeTask("t1", "DONE")];

    const applyOptimistic = vi.fn();
    const applyServerTask = vi.fn();
    const rollback = vi.fn();
    const onError = vi.fn();
    const persist = vi.fn().mockRejectedValue(new Error("Network down"));

    const ok = await persistTaskMove({
      previousTasks: previous,
      nextTasks: next,
      taskId: "t1",
      patch: { status: "DONE", sortOrder: 0 },
      applyOptimistic,
      persist,
      applyServerTask,
      rollback,
      onError,
    });

    expect(ok).toBe(false);
    expect(applyOptimistic).toHaveBeenCalledWith(next);
    expect(rollback).toHaveBeenCalledWith(previous);
    expect(applyServerTask).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith("Network down");
  });

  it("applies optimistic state before awaiting the network call", async () => {
    const previous = [makeTask("t1", "TODO")];
    const next = [makeTask("t1", "IN_PROGRESS")];
    const order: string[] = [];

    const persist = vi.fn().mockImplementation(async () => {
      order.push("persist");
      return next[0]!;
    });

    await persistTaskMove({
      previousTasks: previous,
      nextTasks: next,
      taskId: "t1",
      patch: { status: "IN_PROGRESS", sortOrder: 0 },
      applyOptimistic: () => {
        order.push("optimistic");
      },
      persist,
      applyServerTask: () => {
        order.push("server");
      },
      rollback: vi.fn(),
      onError: vi.fn(),
    });

    expect(order).toEqual(["optimistic", "persist", "server"]);
  });
});
