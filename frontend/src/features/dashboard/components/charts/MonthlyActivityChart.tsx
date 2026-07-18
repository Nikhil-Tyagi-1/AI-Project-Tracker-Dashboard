"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartPalette } from "@/constants/charts";
import { ChartPanel } from "@/features/dashboard/components/charts/ChartPanel";
import {
  formatMonthLabel,
  isMonthlyActivityEmpty,
} from "@/features/dashboard/chartUtils";
import type { MonthlyActivityPoint } from "@/types/dashboard";

export type MonthlyActivityChartProps = {
  data: MonthlyActivityPoint[];
  height?: number;
};

/**
 * Multi-line chart — creates vs updates over the last six months.
 * Reusable on Dashboard and Analytics.
 */
export function MonthlyActivityChart({
  data,
  height = 280,
}: MonthlyActivityChartProps) {
  const empty = isMonthlyActivityEmpty(data);

  return (
    <ChartPanel
      title="Monthly Activity"
      description="Creates and updates across the last 6 months"
      empty={empty}
      emptyTitle="No monthly activity"
      emptyDescription="Activity lines appear as projects and tasks are created or updated."
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickFormatter={formatMonthLabel}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={36} />
          <Tooltip
            labelFormatter={(label) => formatMonthLabel(String(label))}
            formatter={(value, name) => [
              String(value),
              name === "created" ? "Created" : "Updated",
            ]}
          />
          <Legend
            formatter={(value) =>
              value === "created" ? "Created" : "Updated"
            }
            wrapperStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="created"
            name="created"
            stroke={chartPalette.primary}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="updated"
            name="updated"
            stroke={chartPalette.warning}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
