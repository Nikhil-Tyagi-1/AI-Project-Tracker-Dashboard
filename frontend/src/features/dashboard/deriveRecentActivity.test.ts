import { describe, expect, it } from "vitest";

import { deriveRecentActivity } from "@/features/dashboard/deriveRecentActivity";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

function makeProject(overrides: Partial<Project> & Pick<Project, "id">): Project {
  return {
    name: `Project ${overrides.id}`,
    description: null,
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    progress: 40,
    ownerId: "owner-1",
    owner: {
      id: "owner-1",
      name: "Alex Morgan",
      email: "alex@example.com",
    },
    startDate: null,
    endDate: null,
    riskNotes: null,
    isArchived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeTask(
  overrides: Partial<Task> & Pick<Task, "id" | "projectId">,
): Task {
  return {
    title: `Task ${overrides.id}`,
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    dueDate: null,
    sortOrder: 0,
    project: {
      id: overrides.projectId,
      name: "Demo Project",
      isArchived: false,
    },
    assigneeId: null,
    assignee: null,
    isArchived: false,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("deriveRecentActivity", () => {
  it("returns an empty list when there are no projects or tasks", () => {
    expect(deriveRecentActivity([], [])).toEqual([]);
  });

  it("emits created and updated events and sorts newest first", () => {
    const projects = [
      makeProject({
        id: "p1",
        name: "Alpha",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-05T00:00:00.000Z",
      }),
    ];
    const tasks = [
      makeTask({
        id: "t1",
        projectId: "p1",
        title: "Ship API",
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-04T00:00:00.000Z",
      }),
    ];

    const items = deriveRecentActivity(projects, tasks, 10);

    expect(items.map((item) => item.id)).toEqual([
      "project-updated-p1",
      "task-updated-t1",
      "task-created-t1",
      "project-created-p1",
    ]);
    expect(items[0]?.action).toBe("updated");
    expect(items[0]?.title).toBe("Alpha");
  });

  it("respects the limit", () => {
    const projects = [
      makeProject({
        id: "p1",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      }),
      makeProject({
        id: "p2",
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-04T00:00:00.000Z",
      }),
    ];

    expect(deriveRecentActivity(projects, [], 2)).toHaveLength(2);
  });
});
