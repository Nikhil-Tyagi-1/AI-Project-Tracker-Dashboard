import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticsView } from "@/features/dashboard/AnalyticsView";
import {
  emptyDashboardSummary,
  seededDashboardSummary,
} from "@/features/dashboard/testFixtures";
import * as dashboardApi from "@/services/api/dashboard";
import { dashboardReducer } from "@/store/slices/dashboardSlice";
import { uiReducer } from "@/store/slices/uiSlice";

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

  it("renders the Analytics page successfully with mocked chart datasets", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      seededDashboardSummary,
    );

    renderAnalytics();

    expect(
      screen.getByRole("heading", { level: 1, name: "Analytics" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Loading dashboard charts" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Portfolio charts" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("region", { name: "Project Progress" }),
    ).toBeInTheDocument();
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
      .mockRejectedValueOnce(new Error("Charts unavailable"))
      .mockResolvedValueOnce(seededDashboardSummary);

    const user = userEvent.setup();
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("Could not load analytics")).toBeInTheDocument();
    expect(screen.getByText("Charts unavailable")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Project Progress" }),
      ).toBeInTheDocument();
    });
  });

  it("shows empty states when the portfolio has no chart data", async () => {
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      emptyDashboardSummary,
    );

    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText("No analytics yet")).toBeInTheDocument();
    });

    expect(screen.getByText("No project progress")).toBeInTheDocument();
    expect(screen.getByText("No task status data")).toBeInTheDocument();
    expect(screen.getByText("No workload data")).toBeInTheDocument();
    expect(screen.getByText("No monthly activity")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create project" }),
    ).toBeInTheDocument();
  });
});
