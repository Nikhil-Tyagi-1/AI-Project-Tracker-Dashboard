import { describe, expect, it } from "vitest";

import { TASK_STATUS_VALUES } from "@/constants/enums";
import { groupTasksByStatus } from "@/features/tasks/groupTasksByStatus";
import type { Task } from "@/types/task";

function makeTask(overrides: Partial<Task> & Pick<Task, "id" | "status">): Task {
  return {
    title: "Task",
    description: null,
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
    ...overrides,
  };
}

describe("groupTasksByStatus", () => {
  it("returns empty arrays for every Kanban status when given no tasks", () => {
    const grouped = groupTasksByStatus([]);

    for (const status of TASK_STATUS_VALUES) {
      expect(grouped[status]).toEqual([]);
    }
  });

  it("places tasks into the matching status columns", () => {
    const grouped = groupTasksByStatus([
      makeTask({ id: "1", status: "TODO", title: "A", sortOrder: 1 }),
      makeTask({ id: "2", status: "DONE", title: "B", sortOrder: 0 }),
      makeTask({ id: "3", status: "IN_PROGRESS", title: "C", sortOrder: 0 }),
      makeTask({ id: "4", status: "IN_REVIEW", title: "D", sortOrder: 0 }),
    ]);

    expect(grouped.TODO.map((task) => task.id)).toEqual(["1"]);
    expect(grouped.IN_PROGRESS.map((task) => task.id)).toEqual(["3"]);
    expect(grouped.IN_REVIEW.map((task) => task.id)).toEqual(["4"]);
    expect(grouped.DONE.map((task) => task.id)).toEqual(["2"]);
  });

  it("sorts each column by sortOrder then title", () => {
    const grouped = groupTasksByStatus([
      makeTask({ id: "1", status: "TODO", title: "Beta", sortOrder: 1 }),
      makeTask({ id: "2", status: "TODO", title: "Alpha", sortOrder: 1 }),
      makeTask({ id: "3", status: "TODO", title: "Zulu", sortOrder: 0 }),
    ]);

    expect(grouped.TODO.map((task) => task.id)).toEqual(["3", "2", "1"]);
  });
});
