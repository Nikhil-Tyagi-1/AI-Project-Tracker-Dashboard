import { describe, expect, it } from "vitest";

import {
  formatMonthLabel,
  isMonthlyActivityEmpty,
  isValueSeriesEmpty,
  truncateChartLabel,
} from "@/features/dashboard/chartUtils";

describe("dashboard chartUtils", () => {
  it("detects empty value series", () => {
    expect(isValueSeriesEmpty([])).toBe(true);
    expect(
      isValueSeriesEmpty([
        { label: "To Do", value: 0 },
        { label: "Done", value: 0 },
      ]),
    ).toBe(true);
    expect(
      isValueSeriesEmpty([
        { label: "To Do", value: 0 },
        { label: "Done", value: 2 },
      ]),
    ).toBe(false);
  });

  it("detects empty monthly activity", () => {
    expect(isMonthlyActivityEmpty([])).toBe(true);
    expect(
      isMonthlyActivityEmpty([
        { label: "2026-01", created: 0, updated: 0 },
        { label: "2026-02", created: 0, updated: 0 },
      ]),
    ).toBe(true);
    expect(
      isMonthlyActivityEmpty([
        { label: "2026-01", created: 1, updated: 0 },
      ]),
    ).toBe(false);
  });

  it("truncates long labels", () => {
    expect(truncateChartLabel("Short", 18)).toBe("Short");
    expect(truncateChartLabel("Customer Portal Redesign", 14)).toBe(
      "Customer Port…",
    );
  });

  it("formats YYYY-MM labels as short months", () => {
    expect(formatMonthLabel("2026-07")).toBe("Jul");
    expect(formatMonthLabel("not-a-month")).toBe("not-a-month");
  });
});
