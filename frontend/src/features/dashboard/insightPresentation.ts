import type { InsightCategory, InsightSeverity } from "@/types/dashboard";

export const insightSeverityLabels: Record<InsightSeverity, string> = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

export const insightCategoryLabels: Record<InsightCategory, string> = {
  risk: "Risk",
  workload: "Workload",
  progress: "Progress",
  deadline: "Deadline",
  portfolio: "Portfolio",
};

/** Map insight severity to MUI palette keys for accents/chips. */
export function insightSeverityAccent(
  severity: InsightSeverity,
): "info" | "warning" | "error" {
  if (severity === "critical") {
    return "error";
  }
  if (severity === "warning") {
    return "warning";
  }
  return "info";
}
