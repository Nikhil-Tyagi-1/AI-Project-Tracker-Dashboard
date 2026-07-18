import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useKanbanTaskMove } from "@/features/tasks/hooks/useKanbanTaskMove";
import * as tasksApi from "@/services/api/tasks";
import { tasksReducer } from "@/store/slices/tasksSlice";
import { uiReducer } from "@/store/slices/uiSlice";
import type { Task } from "@/types/task";

vi.mock("@/services/api/tasks", () => ({
  updateTask: vi.fn(),
}));

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

function createTestStore(tasks: Task[]) {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
      ui: uiReducer,
    },
    preloadedState: {
      tasks: {
        items: tasks,
        selectedTask: null,
        meta: { total: tasks.length, page: 1, pageSize: 100 },
        filters: {
          projectId: "proj-1",
          search: "",
          status: "" as const,
          priority: "" as const,
          assigneeId: "",
          sortBy: "sortOrder" as const,
          sortOrder: "asc" as const,
          page: 1,
          pageSize: 100,
          includeArchived: false,
        },
        listStatus: "succeeded" as const,
        detailStatus: "idle" as const,
        mutationStatus: "idle" as const,
        listError: null,
        detailError: null,
        mutationError: null,
      },
    },
  });
}

describe("useKanbanTaskMove — status update flow", () => {
  const initialTasks = [
    makeTask({ id: "t1", status: "TODO", sortOrder: 0, title: "One" }),
    makeTask({ id: "t2", status: "IN_PROGRESS", sortOrder: 0, title: "Two" }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("optimistically moves a task via menu status change and syncs the API result", async () => {
    const store = createTestStore(initialTasks);
    const saved = makeTask({
      id: "t1",
      status: "DONE",
      sortOrder: 0,
      title: "One",
      updatedAt: "2026-07-18T12:00:00.000Z",
    });
    vi.mocked(tasksApi.updateTask).mockResolvedValue(saved);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useKanbanTaskMove(), { wrapper });

    let ok = false;
    await act(async () => {
      ok = await result.current.changeTaskStatus("t1", "DONE");
    });

    expect(ok).toBe(true);
    expect(tasksApi.updateTask).toHaveBeenCalledWith("t1", {
      status: "DONE",
      sortOrder: 0,
    });

    await waitFor(() => {
      const task = store.getState().tasks.items.find((item) => item.id === "t1");
      expect(task?.status).toBe("DONE");
      expect(task?.updatedAt).toBe(saved.updatedAt);
    });

    expect(
      store.getState().tasks.items.find((item) => item.id === "t1")?.status,
    ).toBe("DONE");
    expect(
      store
        .getState()
        .tasks.items.filter((item) => item.status === "TODO")
        .map((item) => item.id),
    ).toEqual([]);
  });

  it("rolls back Redux state and enqueues an error toast when the API fails", async () => {
    const store = createTestStore(initialTasks);
    vi.mocked(tasksApi.updateTask).mockRejectedValue(
      new Error("Request failed with status code 500"),
    );

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useKanbanTaskMove(), { wrapper });

    let ok = true;
    await act(async () => {
      ok = await result.current.changeTaskStatus("t1", "IN_REVIEW");
    });

    expect(ok).toBe(false);

    await waitFor(() => {
      expect(
        store.getState().tasks.items.find((item) => item.id === "t1")?.status,
      ).toBe("TODO");
    });

    const toasts = store.getState().ui.toasts;
    expect(toasts.length).toBeGreaterThan(0);
    expect(toasts[0]?.severity).toBe("error");
    expect(toasts[0]?.message).toMatch(/request failed|500/i);
  });

  it("optimistically reorders via moveTaskTo and keeps the card in the new column", async () => {
    const store = createTestStore(initialTasks);
    const saved = makeTask({
      id: "t1",
      status: "IN_PROGRESS",
      sortOrder: 1,
      title: "One",
    });
    vi.mocked(tasksApi.updateTask).mockResolvedValue(saved);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useKanbanTaskMove(), { wrapper });

    await act(async () => {
      await result.current.moveTaskTo("t1", "IN_PROGRESS", 1);
    });

    expect(tasksApi.updateTask).toHaveBeenCalledWith("t1", {
      status: "IN_PROGRESS",
      sortOrder: 1,
    });

    const inProgress = store
      .getState()
      .tasks.items.filter((item) => item.status === "IN_PROGRESS")
      .sort((a, b) => a.sortOrder - b.sortOrder);

    expect(inProgress.map((item) => item.id)).toEqual(["t2", "t1"]);
  });
});
