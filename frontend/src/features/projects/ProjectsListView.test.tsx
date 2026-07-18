import { configureStore } from "@reduxjs/toolkit";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectsListView } from "@/features/projects/ProjectsListView";
import * as projectsApi from "@/services/api/projects";
import { projectsReducer } from "@/store/slices/projectsSlice";
import { uiReducer } from "@/store/slices/uiSlice";
import type { Project } from "@/types/project";

vi.mock("@/services/api/projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const sampleProject: Project = {
  id: "proj-1",
  name: "Alpha Portal",
  description: "Portal redesign",
  status: "IN_PROGRESS",
  priority: "HIGH",
  progress: 40,
  ownerId: "user-1",
  owner: {
    id: "user-1",
    name: "Alex Morgan",
    email: "alex@example.com",
  },
  startDate: null,
  endDate: null,
  riskNotes: null,
  isArchived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

function createTestStore() {
  return configureStore({
    reducer: {
      projects: projectsReducer,
      ui: uiReducer,
    },
  });
}

function renderListView() {
  const store = createTestStore();
  const view = render(
    <Provider store={store}>
      <ProjectsListView />
    </Provider>,
  );
  return { store, ...view };
}

describe("ProjectsListView — search & filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectsApi.getProjects).mockResolvedValue({
      data: [sampleProject],
      meta: { total: 1, page: 1, pageSize: 20 },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads projects on mount", async () => {
    renderListView();

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalled();
    });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Projects" }),
    ).toBeInTheDocument();
  });

  it("debounces search input before dispatching the query", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });

    renderListView();

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    });

    const search = screen.getByRole("textbox", { name: /^search$/i });
    await user.type(search, "portal");

    // Still only the initial fetch — debounce window has not elapsed.
    expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({ q: "portal" }),
      );
    });
  });

  it("does not fire a search request on every keystroke", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });

    renderListView();
    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    });

    const search = screen.getByRole("textbox", { name: /^search$/i });
    await user.type(search, "abc");

    // Advance less than the debounce delay between bursts — still one call.
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({ q: "abc" }),
      );
    });
  });

  it("filters by status and requests matching projects", async () => {
    const user = userEvent.setup();
    renderListView();

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("combobox", { name: /^status$/i }));
    await user.click(screen.getByRole("option", { name: /at risk/i }));

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({ status: "AT_RISK" }),
      );
    });
  });

  it("filters by priority and requests matching projects", async () => {
    const user = userEvent.setup();
    renderListView();

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("combobox", { name: /^priority$/i }));
    await user.click(screen.getByRole("option", { name: /^critical$/i }));

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({ priority: "CRITICAL" }),
      );
    });
  });

  it("filters by owner after debounce", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });

    renderListView();
    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    });

    await user.type(
      screen.getByRole("textbox", { name: /^owner$/i }),
      "Alex",
    );

    expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledWith(
        expect.objectContaining({ owner: "Alex" }),
      );
    });
  });

  it("resets search and filters back to defaults", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });

    const { store } = renderListView();
    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("combobox", { name: /^status$/i }));
    await user.click(screen.getByRole("option", { name: /on hold/i }));

    await user.click(screen.getByRole("combobox", { name: /^priority$/i }));
    await user.click(screen.getByRole("option", { name: /^high$/i }));

    await user.type(
      screen.getByRole("textbox", { name: /^search$/i }),
      "portal",
    );
    await user.type(
      screen.getByRole("textbox", { name: /^owner$/i }),
      "Alex",
    );

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(store.getState().projects.filters.status).toBe("ON_HOLD");
      expect(store.getState().projects.filters.priority).toBe("HIGH");
      expect(store.getState().projects.filters.q).toBe("portal");
      expect(store.getState().projects.filters.owner).toBe("Alex");
    });

    await user.click(screen.getByRole("button", { name: /reset filters/i }));

    expect(screen.getByRole("textbox", { name: /^search$/i })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /^owner$/i })).toHaveValue("");

    await waitFor(() => {
      expect(store.getState().projects.filters).toMatchObject({
        q: "",
        status: "",
        priority: "",
        owner: "",
      });
    });

    await waitFor(() => {
      const lastCall = vi.mocked(projectsApi.getProjects).mock.calls.at(-1)?.[0];
      expect(lastCall).not.toHaveProperty("q");
      expect(lastCall).not.toHaveProperty("status");
      expect(lastCall).not.toHaveProperty("priority");
      expect(lastCall).not.toHaveProperty("owner");
    });
  });
});
