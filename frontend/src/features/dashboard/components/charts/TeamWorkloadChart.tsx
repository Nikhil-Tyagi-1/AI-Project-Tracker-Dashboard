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

export type TeamWorkloadChartProps = {
  data: ChartDataPoint[];
  height?: number;
};

/**
 * Vertical bar chart — task counts by assignee (includes Unassigned).
 * Reusable on Dashboard and Analytics.
 */
export function TeamWorkloadChart({
  data,
  height = 280,
}: TeamWorkloadChartProps) {
  const empty = isValueSeriesEmpty(data);

  return (
    <ChartPanel
      title="Team Workload"
      description="Open and completed tasks by assignee"
      empty={empty}
      emptyTitle="No workload data"
      emptyDescription="Assignee bars appear once tasks are assigned on active projects."
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 48 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            interval={0}
            angle={-28}
            textAnchor="end"
            height={56}
            tickFormatter={(value: string) => truncateChartLabel(value, 12)}
            tick={{ fontSize: 11 }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
          <Tooltip
            cursor={{ fill: chartPalette.hover }}
            formatter={(value) => [String(value), "Tasks"]}
            labelFormatter={(label) => String(label)}
          />
          <Bar
            dataKey="value"
            name="Tasks"
            fill={chartPalette.secondary}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
