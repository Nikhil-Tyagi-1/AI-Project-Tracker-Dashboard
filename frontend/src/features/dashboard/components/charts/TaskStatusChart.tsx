"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { chartPalette } from "@/constants/charts";
import { colorTokens } from "@/theme/tokens";
import { ChartPanel } from "@/features/dashboard/components/charts/ChartPanel";
import { isValueSeriesEmpty } from "@/features/dashboard/chartUtils";
import type { ChartDataPoint } from "@/types/dashboard";

const STATUS_COLORS: Record<string, string> = {
  "To Do": colorTokens.status.todo,
  "In Progress": colorTokens.status.inProgress,
  "In Review": colorTokens.status.inReview,
  Done: colorTokens.status.done,
};

export type TaskStatusChartProps = {
  data: ChartDataPoint[];
  height?: number;
};

/**
 * Donut chart — task counts by status (stable four-status legend).
 * Reusable on Dashboard and Analytics.
 */
export function TaskStatusChart({
  data,
  height = 280,
}: TaskStatusChartProps) {
  const empty = isValueSeriesEmpty(data);

  return (
    <ChartPanel
      title="Task Status"
      description="Distribution across Kanban statuses"
      empty={empty}
      emptyTitle="No task status data"
      emptyDescription="Status counts appear once tasks exist on active projects."
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="46%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.label}
                fill={
                  STATUS_COLORS[entry.label] ??
                  chartPalette.series[index % chartPalette.series.length]
                }
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [String(value), String(name)]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
