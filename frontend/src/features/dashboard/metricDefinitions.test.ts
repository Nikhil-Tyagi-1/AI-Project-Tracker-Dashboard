import { describe, expect, it } from "vitest";

import {
  DASHBOARD_METRIC_DEFINITIONS,
  formatMetricValue,
} from "@/features/dashboard/metricDefinitions";

describe("dashboard metricDefinitions", () => {
  it("covers all eight summary metric keys", () => {
    const keys = DASHBOARD_METRIC_DEFINITIONS.map((item) => item.key);

    expect(keys).toEqual([
      "totalProjects",
      "activeProjects",
      "completedProjects",
      "atRiskProjects",
      "totalTasks",
      "completedTasks",
      "pendingTasks",
      "completionPercentage",
    ]);
  });

  it("formats percent and number values", () => {
    expect(formatMetricValue(37, "percent")).toBe("37%");
    expect(formatMetricValue(0, "percent")).toBe("0%");
    expect(formatMetricValue(12, "number")).toBe("12");
  });
});
