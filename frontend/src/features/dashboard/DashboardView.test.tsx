import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardView } from "@/features/dashboard/DashboardView";
import {
  emptyDashboardSummary,
  seededDashboardInsights,
  seededDashboardSummary,
} from "@/features/dashboard/testFixtures";
import * as dashboardApi from "@/services/api/dashboard";
import * as projectsApi from "@/services/api/projects";
import * as tasksApi from "@/services/api/tasks";
import { dashboardReducer } from "@/store/slices/dashboardSlice";
import { uiReducer } from "@/store/slices/uiSlice";

vi.mock("@/services/api/dashboard", () => ({
  getDashboardSummary: vi.fn(),
  getDashboardInsights: vi.fn(),
}));

vi.mock("@/services/api/projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/services/api/tasks", () => ({
  getTasks: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
      <div style={{ width: 400, height: 280 }}>{children}</div>
    ),
  };
});

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

function createTestStore() {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer,
      ui: uiReducer,
    },
  });
}

function renderDashboard() {
  const store = createTestStore();
  const view = render(
    <Provider store={store}>
      <DashboardView />
    </Provider>,
  );
  return { store, ...view };
}

describe("DashboardView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardApi.getDashboardInsights).mockResolvedValue({
      insights: [],
      generatedAt: "2026-07-18T08:30:00.000Z",
    });
    vi.mocked(projectsApi.getProjects).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, pageSize: 10 },
    });
    vi.mocked(tasksApi.getTasks).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, pageSize: 20 },
    });
  });

  it("renders the Dashboard page successfully with mocked summary data", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      seededDashboardSummary,
    );
    vi.mocked(dashboardApi.getDashboardInsights).mockResolvedValue(
      seededDashboardInsights,
    );

    renderDashboard();

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Loading dashboard metrics" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Loading dashboard charts" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("article", { name: "Total Projects: 5" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("region", { name: "Portfolio charts" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Smart Insights")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("displays metric cards from mocked /dashboard/summary values", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      seededDashboardSummary,
    );

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByRole("article", { name: "Total Projects: 5" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("article", { name: "Active Projects: 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Completed Projects: 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "At Risk Projects: 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Total Tasks: 27" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Completed Tasks: 10" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Pending Tasks: 17" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Completion Percentage: 37%" }),
    ).toBeInTheDocument();
  });

  it("renders chart widgets from mocked summary datasets", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      seededDashboardSummary,
    );

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Project Progress" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("region", { name: "Task Status" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Team Workload" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Monthly Activity" }),
    ).toBeInTheDocument();
  });

  it("shows an error state with retry when the summary request fails", async () => {
    vi.mocked(dashboardApi.getDashboardSummary)
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce(seededDashboardSummary);

    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("Could not load dashboard")).toBeInTheDocument();
    expect(screen.getByText("Network down")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(
        screen.getByRole("article", { name: "Total Projects: 5" }),
      ).toBeInTheDocument();
    });
  });

  it("shows empty states when the portfolio has no projects", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      emptyDashboardSummary,
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("No projects yet")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("article", { name: "Total Projects: 0" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No project progress")).toBeInTheDocument();
    expect(screen.getByText("No task status data")).toBeInTheDocument();
    expect(screen.getByText("No workload data")).toBeInTheDocument();
    expect(screen.getByText("No monthly activity")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create project" }),
    ).toBeInTheDocument();
  });
});
