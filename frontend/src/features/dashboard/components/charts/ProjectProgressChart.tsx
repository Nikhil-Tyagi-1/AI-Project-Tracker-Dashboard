"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartPalette } from "@/constants/charts";
import { ChartPanel } from "@/features/dashboard/components/charts/ChartPanel";
import {
  isValueSeriesEmpty,
  truncateChartLabel,
} from "@/features/dashboard/chartUtils";
import type { ChartDataPoint } from "@/types/dashboard";

export type ProjectProgressChartProps = {
  data: ChartDataPoint[];
  /** Optional override for the plot area height. */
  height?: number;
};

/**
 * Horizontal bar chart — project name → progress (0–100).
 * Reusable on Dashboard and Analytics.
 */
export function ProjectProgressChart({
  data,
  height = 280,
}: ProjectProgressChartProps) {
  const empty = isValueSeriesEmpty(data);

  return (
    <ChartPanel
      title="Project Progress"
      description="Progress percentage by project"
      empty={empty}
      emptyTitle="No project progress"
      emptyDescription="Progress bars appear once active projects exist."
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value: number) => `${value}%`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={96}
            tickFormatter={(value: string) => truncateChartLabel(value, 14)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${String(value)}%`, "Progress"]}
            labelFormatter={(label) => String(label)}
          />
          <Bar
            dataKey="value"
            name="Progress"
            fill={chartPalette.primary}
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
