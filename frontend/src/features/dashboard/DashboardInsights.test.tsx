import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardView } from "@/features/dashboard/DashboardView";
import {
  sampleActivityProject,
  sampleActivityTask,
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

vi.mock("next/link", () => {
  const React = require("react") as typeof import("react");
  return {
    default: React.forwardRef(function MockLink(
      {
        children,
        href,
        ...rest
      }: {
        children: ReactNode;
        href: string;
      },
      ref: React.Ref<HTMLAnchorElement>,
    ) {
      return (
        <a href={href} ref={ref} {...rest}>
          {children}
        </a>
      );
    }),
  };
});

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

describe("DashboardView — insights & activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardApi.getDashboardSummary).mockResolvedValue(
      seededDashboardSummary,
    );
    vi.mocked(dashboardApi.getDashboardInsights).mockResolvedValue(
      seededDashboardInsights,
    );
    vi.mocked(projectsApi.getProjects).mockResolvedValue({
      data: [sampleActivityProject],
      meta: { total: 1, page: 1, pageSize: 10 },
    });
    vi.mocked(tasksApi.getTasks).mockResolvedValue({
      data: [sampleActivityTask],
      meta: { total: 1, page: 1, pageSize: 20 },
    });
  });

  it("renders Smart Insights cards from mocked /dashboard/insights", async () => {
    renderDashboard();

    expect(
      screen.getByRole("status", { name: "Loading smart insights" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("1 project at risk")).toBeInTheDocument();
    });

    expect(screen.getByText("Smart Insights")).toBeInTheDocument();
    expect(screen.getByText("Task completion is behind")).toBeInTheDocument();
    expect(
      screen.getByText("One project is marked AT_RISK. Review risk notes."),
    ).toBeInTheDocument();
  });

  it("keeps the dashboard usable when insights fail", async () => {
    vi.mocked(dashboardApi.getDashboardInsights).mockRejectedValue(
      new Error("Insights offline"),
    );

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByRole("article", { name: "Total Projects: 5" }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Could not load insights")).toBeInTheDocument();
    expect(screen.getByText("Insights offline")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Project Progress" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("retries insights without blocking the rest of the page", async () => {
    vi.mocked(dashboardApi.getDashboardInsights)
      .mockRejectedValueOnce(new Error("Insights offline"))
      .mockResolvedValueOnce(seededDashboardInsights);

    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Could not load insights")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.getByText("1 project at risk")).toBeInTheDocument();
    });
  });

  it("renders recent activity items derived from projects and tasks", async () => {
    renderDashboard();

    await waitFor(() => {
      expect(projectsApi.getProjects).toHaveBeenCalled();
      expect(tasksApi.getTasks).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("list", { name: "Recent activity items" }),
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText("Draft wireframes").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Customer Portal Redesign").length,
    ).toBeGreaterThan(0);
  });

  it("shows EmptyState when there is no recent activity", async () => {
    vi.mocked(projectsApi.getProjects).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, pageSize: 10 },
    });
    vi.mocked(tasksApi.getTasks).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, pageSize: 20 },
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("No recent activity")).toBeInTheDocument();
    });
  });

  it("shows EmptyState when insights array is empty", async () => {
    vi.mocked(dashboardApi.getDashboardInsights).mockResolvedValue({
      insights: [],
      generatedAt: "2026-07-18T08:30:00.000Z",
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("No insights right now")).toBeInTheDocument();
    });
  });
});
