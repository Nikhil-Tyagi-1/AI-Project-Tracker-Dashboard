import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticsView } from "@/features/dashboard/AnalyticsView";
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
    projectProgress: [
      { label: "API Gateway Migration", value: 100 },
      { label: "Customer Portal Redesign", value: 45 },
    ],
    taskStatusDistribution: [
      { label: "To Do", value: 10 },
      { label: "In Progress", value: 4 },
      { label: "In Review", value: 3 },
      { label: "Done", value: 10 },
    ],
    teamWorkload: [
      { label: "Jordan Lee", value: 7 },
      { label: "Unassigned", value: 2 },
    ],
    monthlyActivity: [
      { label: "2026-02", created: 3, updated: 0 },
      { label: "2026-03", created: 4, updated: 0 },
      { label: "2026-04", created: 5, updated: 0 },
      { label: "2026-05", created: 7, updated: 0 },
      { label: "2026-06", created: 13, updated: 0 },
      { label: "2026-07", created: 0, updated: 8 },
    ],
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

function renderAnalytics() {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <AnalyticsView />
    </Provider>,
  );
}

describe("AnalyticsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the four chart widgets from /dashboard/summary", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      seededSummary,
    );

    renderAnalytics();

    expect(
      screen.getByRole("status", { name: "Loading dashboard charts" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Project Progress")).toBeInTheDocument();
    });

    expect(screen.getByText("Task Status")).toBeInTheDocument();
    expect(screen.getByText("Team Workload")).toBeInTheDocument();
    expect(screen.getByText("Monthly Activity")).toBeInTheDocument();
  });

  it("shows an error state with retry when the summary request fails", async () => {
    vi.mocked(dashboardApi.getDashboardSummary)
      .mockRejectedValueOnce(new Error("Charts unavailable"))
      .mockResolvedValueOnce(seededSummary);

    const user = userEvent.setup();
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("Could not load analytics")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.getByText("Project Progress")).toBeInTheDocument();
    });
  });
});
