import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardView } from "@/features/dashboard/DashboardView";
import * as dashboardApi from "@/services/api/dashboard";
import { dashboardReducer } from "@/store/slices/dashboardSlice";
import { uiReducer } from "@/store/slices/uiSlice";
import type { DashboardSummary } from "@/types/dashboard";

vi.mock("@/services/api/dashboard", () => ({
  getDashboardSummary: vi.fn(),
  getDashboardInsights: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const seededSummary: DashboardSummary = {
  metrics: {
    totalProjects: 5,
    activeProjects: 1,
    completedProjects: 1,
    atRiskProjects: 1,
    totalTasks: 27,
    completedTasks: 10,
    pendingTasks: 17,
    completionPercentage: 37,
  },
  charts: {
    projectProgress: [],
    taskStatusDistribution: [
      { label: "To Do", value: 0 },
      { label: "In Progress", value: 0 },
      { label: "In Review", value: 0 },
      { label: "Done", value: 0 },
    ],
    teamWorkload: [],
    monthlyActivity: [],
  },
};

const emptySummary: DashboardSummary = {
  metrics: {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    atRiskProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionPercentage: 0,
  },
  charts: {
    projectProgress: [],
    taskStatusDistribution: [
      { label: "To Do", value: 0 },
      { label: "In Progress", value: 0 },
      { label: "In Review", value: 0 },
      { label: "Done", value: 0 },
    ],
    teamWorkload: [],
    monthlyActivity: [],
  },
};

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
  });

  it("renders metric cards from /dashboard/summary", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      seededSummary,
    );

    renderDashboard();

    expect(
      screen.getByRole("status", { name: "Loading dashboard metrics" }),
    ).toBeInTheDocument();

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

  it("shows an error state with retry when the summary request fails", async () => {
    vi.mocked(dashboardApi.getDashboardSummary)
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce(seededSummary);

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

  it("shows an empty state when the portfolio has no projects", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      emptySummary,
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("No projects yet")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("article", { name: "Total Projects: 0" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create project" }),
    ).toBeInTheDocument();
  });
});
