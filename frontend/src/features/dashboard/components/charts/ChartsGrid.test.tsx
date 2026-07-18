import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ChartsGrid } from "@/features/dashboard/components/charts/ChartsGrid";
import { ProjectProgressChart } from "@/features/dashboard/components/charts/ProjectProgressChart";
import { TaskStatusChart } from "@/features/dashboard/components/charts/TaskStatusChart";
import type { DashboardCharts } from "@/types/dashboard";

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

const chartsWithData: DashboardCharts = {
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
    { label: "2026-03", created: 4, updated: 1 },
    { label: "2026-04", created: 5, updated: 0 },
    { label: "2026-05", created: 7, updated: 2 },
    { label: "2026-06", created: 13, updated: 0 },
    { label: "2026-07", created: 0, updated: 8 },
  ],
};

const emptyCharts: DashboardCharts = {
  projectProgress: [],
  taskStatusDistribution: [
    { label: "To Do", value: 0 },
    { label: "In Progress", value: 0 },
    { label: "In Review", value: 0 },
    { label: "Done", value: 0 },
  ],
  teamWorkload: [],
  monthlyActivity: [
    { label: "2026-02", created: 0, updated: 0 },
    { label: "2026-03", created: 0, updated: 0 },
    { label: "2026-04", created: 0, updated: 0 },
    { label: "2026-05", created: 0, updated: 0 },
    { label: "2026-06", created: 0, updated: 0 },
    { label: "2026-07", created: 0, updated: 0 },
  ],
};

describe("chart widgets", () => {
  it("renders Project Progress with data", () => {
    render(<ProjectProgressChart data={chartsWithData.projectProgress} />);
    expect(
      screen.getByRole("region", { name: "Project Progress" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Project Progress")).toBeInTheDocument();
  });

  it("shows empty state when Project Progress has no points", () => {
    render(<ProjectProgressChart data={[]} />);
    expect(screen.getByText("No project progress")).toBeInTheDocument();
  });

  it("renders Task Status donut with status labels", () => {
    render(
      <TaskStatusChart data={chartsWithData.taskStatusDistribution} />,
    );
    expect(
      screen.getByRole("region", { name: "Task Status" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Task Status")).toBeInTheDocument();
  });

  it("renders all four charts in ChartsGrid", () => {
    render(<ChartsGrid charts={chartsWithData} />);

    expect(
      screen.getByRole("region", { name: "Portfolio charts" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Project Progress")).toBeInTheDocument();
    expect(screen.getByText("Task Status")).toBeInTheDocument();
    expect(screen.getByText("Team Workload")).toBeInTheDocument();
    expect(screen.getByText("Monthly Activity")).toBeInTheDocument();
  });

  it("shows per-chart empty states when series are empty", () => {
    render(<ChartsGrid charts={emptyCharts} />);

    expect(screen.getByText("No project progress")).toBeInTheDocument();
    expect(screen.getByText("No task status data")).toBeInTheDocument();
    expect(screen.getByText("No workload data")).toBeInTheDocument();
    expect(screen.getByText("No monthly activity")).toBeInTheDocument();
  });
});
