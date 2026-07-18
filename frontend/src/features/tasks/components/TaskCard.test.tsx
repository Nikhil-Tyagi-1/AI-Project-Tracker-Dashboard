import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskCard } from "@/features/tasks/components/TaskCard";
import type { Task } from "@/types/task";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    setActivatorNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => undefined,
    },
  },
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Ship release notes",
    description: null,
    status: "TODO",
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

describe("TaskCard — accessible status menu", () => {
  it("exposes a non-drag status alternative in the actions menu", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <TaskCard
        task={makeTask()}
        onStatusChange={onStatusChange}
        onEdit={vi.fn()}
        onArchive={vi.fn()}
        onRestore={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /actions for ship release notes/i }),
    );

    expect(screen.getByRole("menuitem", { name: /to do/i })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /in progress/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /in review/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /^done$/i })).toBeInTheDocument();
  });

  it("updates task status when a different status is selected", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <TaskCard
        task={makeTask({ status: "TODO" })}
        onStatusChange={onStatusChange}
        onEdit={vi.fn()}
        onArchive={vi.fn()}
        onRestore={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /actions for ship release notes/i }),
    );
    await user.click(screen.getByRole("menuitem", { name: /in progress/i }));

    expect(onStatusChange).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith("task-1", "IN_PROGRESS");
  });

  it("does not call onStatusChange when the current status is re-selected", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <TaskCard
        task={makeTask({ status: "TODO" })}
        onStatusChange={onStatusChange}
        onEdit={vi.fn()}
        onArchive={vi.fn()}
        onRestore={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /actions for ship release notes/i }),
    );
    await user.click(screen.getByRole("menuitem", { name: /to do/i }));

    expect(onStatusChange).not.toHaveBeenCalled();
  });
});
