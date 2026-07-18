import { ProjectStatus, TaskStatus } from "@prisma/client";
import { prisma } from "../prisma/client";

// ---------------------------------------------------------------------------
// Chart / metric contracts (chart-ready: labels + values for a thin frontend)
// ---------------------------------------------------------------------------

/** Single { label, value } point used by bar and pie charts. */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/** Monthly activity point — two series for a multi-line chart. */
export interface MonthlyActivityPoint {
  label: string;
  created: number;
  updated: number;
}

export interface DashboardMetrics {
  totalProjects: number;
  /** Non-archived projects with status IN_PROGRESS. */
  activeProjects: number;
  completedProjects: number;
  atRiskProjects: number;
  totalTasks: number;
  /** Tasks with status DONE. */
  completedTasks: number;
  /** Tasks not yet DONE (TODO | IN_PROGRESS | IN_REVIEW). */
  pendingTasks: number;
  /** Round((completedTasks / totalTasks) * 100); 0 when there are no tasks. */
  completionPercentage: number;
}

export interface DashboardCharts {
  /** Bar: project name → progress (0–100). */
  projectProgress: ChartDataPoint[];
  /** Pie: task status → count (all four statuses always present). */
  taskStatusDistribution: ChartDataPoint[];
  /** Bar: assignee display name → task count (includes Unassigned). */
  teamWorkload: ChartDataPoint[];
  /** Line: last N months of create / update activity. */
  monthlyActivity: MonthlyActivityPoint[];
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  charts: DashboardCharts;
}

export type InsightSeverity = "info" | "warning" | "critical";

export interface DashboardInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  message: string;
  category: "risk" | "workload" | "progress" | "deadline" | "portfolio";
}

export interface DashboardInsights {
  insights: DashboardInsight[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How many calendar months to include in the monthly activity series. */
const MONTHLY_ACTIVITY_WINDOW = 6;

const TASK_STATUS_ORDER: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const UNASSIGNED_LABEL = "Unassigned";

/** Shared filter: exclude soft-deleted rows and tasks under archived projects. */
const ACTIVE_PROJECT_WHERE = { isArchived: false } as const;
const ACTIVE_TASK_WHERE = {
  isArchived: false,
  project: { isArchived: false },
} as const;

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function countByKey<T extends string>(
  rows: Array<{ key: T; count: number }>,
  key: T,
): number {
  return rows.find((row) => row.key === key)?.count ?? 0;
}

/** Format a Date as YYYY-MM for chart labels / bucketing. */
function toYearMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Build the last `windowMonths` year-month keys ending at the current UTC month,
 * oldest → newest (left-to-right on a line chart).
 */
function buildMonthWindow(windowMonths: number, now = new Date()): string[] {
  const months: string[] = [];
  const cursor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  for (let i = windowMonths - 1; i >= 0; i -= 1) {
    const d = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - i, 1),
    );
    months.push(toYearMonth(d));
  }

  return months;
}

/**
 * Count records whose timestamp falls in each month key.
 * Updates exclude pure creates (updatedAt === createdAt) so the "updated"
 * series reflects real edits rather than double-counting inserts.
 */
function bucketMonthlyActivity(
  monthKeys: string[],
  records: Array<{ createdAt: Date; updatedAt: Date }>,
): MonthlyActivityPoint[] {
  const createdCounts = new Map<string, number>(
    monthKeys.map((key) => [key, 0]),
  );
  const updatedCounts = new Map<string, number>(
    monthKeys.map((key) => [key, 0]),
  );

  for (const record of records) {
    const createdKey = toYearMonth(record.createdAt);
    if (createdCounts.has(createdKey)) {
      createdCounts.set(createdKey, (createdCounts.get(createdKey) ?? 0) + 1);
    }

    const wasEdited = record.updatedAt.getTime() !== record.createdAt.getTime();
    if (wasEdited) {
      const updatedKey = toYearMonth(record.updatedAt);
      if (updatedCounts.has(updatedKey)) {
        updatedCounts.set(
          updatedKey,
          (updatedCounts.get(updatedKey) ?? 0) + 1,
        );
      }
    }
  }

  return monthKeys.map((label) => ({
    label,
    created: createdCounts.get(label) ?? 0,
    updated: updatedCounts.get(label) ?? 0,
  }));
}

/**
 * Detect a simple workload imbalance: max assignee load is at least twice the
 * average among assignees who have work (Unassigned excluded from the ratio).
 */
function detectWorkloadImbalance(
  workload: ChartDataPoint[],
): { maxLabel: string; maxCount: number; avgCount: number } | null {
  const assigned = workload.filter(
    (point) => point.label !== UNASSIGNED_LABEL && point.value > 0,
  );

  if (assigned.length < 2) {
    return null;
  }

  const total = assigned.reduce((sum, point) => sum + point.value, 0);
  const avgCount = total / assigned.length;
  const maxPoint = assigned.reduce((best, point) =>
    point.value > best.value ? point : best,
  );

  if (maxPoint.value >= avgCount * 2 && maxPoint.value >= 3) {
    return { maxLabel: maxPoint.label, maxCount: maxPoint.value, avgCount };
  }

  return null;
}

// ---------------------------------------------------------------------------
// getSummary
// ---------------------------------------------------------------------------

/**
 * Aggregate portfolio metrics and chart-ready series for the Dashboard.
 *
 * Business rules:
 *   - Archived projects (and tasks under them) are excluded from all aggregates
 *     (spec.md FR-P05 / FR-D01).
 *   - "Active projects" maps to status IN_PROGRESS.
 *   - "Pending tasks" are all non-DONE statuses.
 *   - Chart payloads are always present (empty arrays / zero-filled series)
 *     so the frontend can render empty states without special-casing nulls.
 */
export async function getSummary(): Promise<DashboardSummary> {
  const [
    projectStatusGroups,
    taskStatusGroups,
    projectsForProgress,
    taskAssigneeGroups,
    users,
    projectTimestamps,
    taskTimestamps,
  ] = await Promise.all([
    prisma.project.groupBy({
      by: ["status"],
      where: ACTIVE_PROJECT_WHERE,
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: ACTIVE_TASK_WHERE,
      _count: { _all: true },
    }),
    prisma.project.findMany({
      where: ACTIVE_PROJECT_WHERE,
      select: { name: true, progress: true },
      orderBy: [{ progress: "desc" }, { name: "asc" }],
    }),
    prisma.task.groupBy({
      by: ["assigneeId"],
      where: ACTIVE_TASK_WHERE,
      _count: { _all: true },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
    }),
    prisma.project.findMany({
      where: ACTIVE_PROJECT_WHERE,
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.task.findMany({
      where: ACTIVE_TASK_WHERE,
      select: { createdAt: true, updatedAt: true },
    }),
  ]);

  // ── Metric cards ──────────────────────────────────────────────────────────

  const projectCounts = projectStatusGroups.map((row) => ({
    key: row.status,
    count: row._count._all,
  }));

  const totalProjects = projectCounts.reduce((sum, row) => sum + row.count, 0);
  const activeProjects = countByKey(projectCounts, ProjectStatus.IN_PROGRESS);
  const completedProjects = countByKey(projectCounts, ProjectStatus.COMPLETED);
  const atRiskProjects = countByKey(projectCounts, ProjectStatus.AT_RISK);

  const taskCounts = taskStatusGroups.map((row) => ({
    key: row.status,
    count: row._count._all,
  }));

  const totalTasks = taskCounts.reduce((sum, row) => sum + row.count, 0);
  const completedTasks = countByKey(taskCounts, TaskStatus.DONE);
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const metrics: DashboardMetrics = {
    totalProjects,
    activeProjects,
    completedProjects,
    atRiskProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    completionPercentage,
  };

  // ── Project Progress (bar) ────────────────────────────────────────────────

  const projectProgress: ChartDataPoint[] = projectsForProgress.map(
    (project) => ({
      label: project.name,
      value: project.progress,
    }),
  );

  // ── Task Status Distribution (pie) ────────────────────────────────────────
  // Always emit all four statuses so the pie legend stays stable.

  const taskStatusDistribution: ChartDataPoint[] = TASK_STATUS_ORDER.map(
    (status) => ({
      label: TASK_STATUS_LABELS[status],
      value: countByKey(taskCounts, status),
    }),
  );

  // ── Team Workload (bar) ───────────────────────────────────────────────────

  const userNameById = new Map(users.map((user) => [user.id, user.name]));

  const teamWorkload: ChartDataPoint[] = taskAssigneeGroups
    .map((row) => ({
      label:
        row.assigneeId === null
          ? UNASSIGNED_LABEL
          : (userNameById.get(row.assigneeId) ?? "Unknown"),
      value: row._count._all,
    }))
    .sort((a, b) => {
      // Unassigned last; otherwise highest load first.
      if (a.label === UNASSIGNED_LABEL) return 1;
      if (b.label === UNASSIGNED_LABEL) return -1;
      return b.value - a.value || a.label.localeCompare(b.label);
    });

  // ── Monthly Activity (line) ───────────────────────────────────────────────

  const monthKeys = buildMonthWindow(MONTHLY_ACTIVITY_WINDOW);
  const monthlyActivity = bucketMonthlyActivity(monthKeys, [
    ...projectTimestamps,
    ...taskTimestamps,
  ]);

  return {
    metrics,
    charts: {
      projectProgress,
      taskStatusDistribution,
      teamWorkload,
      monthlyActivity,
    },
  };
}

// ---------------------------------------------------------------------------
// getInsights
// ---------------------------------------------------------------------------

/**
 * Build mock Smart Insights cards from current portfolio data.
 *
 * Deterministic heuristics only — no external AI / LLM calls (spec.md FR-D04).
 * Returns an empty `insights` array when the portfolio has nothing notable
 * (or is empty), so the UI can show an empty state.
 */
export async function getInsights(): Promise<DashboardInsights> {
  const summary = await getSummary();
  const { metrics, charts } = summary;
  const insights: DashboardInsight[] = [];
  const now = new Date();

  // At-risk portfolio concentration
  if (metrics.atRiskProjects > 0) {
    insights.push({
      id: "insight-at-risk",
      severity: metrics.atRiskProjects >= 2 ? "critical" : "warning",
      title: `${metrics.atRiskProjects} project${metrics.atRiskProjects === 1 ? "" : "s"} at risk`,
      message:
        metrics.atRiskProjects === 1
          ? "One project is marked AT_RISK. Review risk notes and reassign capacity if needed."
          : `${metrics.atRiskProjects} projects are marked AT_RISK. Prioritise mitigation before delivery dates slip further.`,
      category: "risk",
    });
  }

  // Task completion health
  if (metrics.totalTasks > 0 && metrics.completionPercentage < 40) {
    insights.push({
      id: "insight-low-completion",
      severity: metrics.completionPercentage < 20 ? "critical" : "warning",
      title: "Task completion is behind",
      message: `Only ${metrics.completionPercentage}% of tasks are done (${metrics.completedTasks} of ${metrics.totalTasks}). Focus on clearing IN_REVIEW and IN_PROGRESS work.`,
      category: "progress",
    });
  } else if (metrics.totalTasks > 0 && metrics.completionPercentage >= 75) {
    insights.push({
      id: "insight-strong-completion",
      severity: "info",
      title: "Strong task completion rate",
      message: `${metrics.completionPercentage}% of active tasks are complete. Maintain momentum on remaining pending work.`,
      category: "progress",
    });
  }

  // Workload imbalance across assignees
  const imbalance = detectWorkloadImbalance(charts.teamWorkload);
  if (imbalance) {
    insights.push({
      id: "insight-workload-imbalance",
      severity: "warning",
      title: "Team workload imbalance detected",
      message: `${imbalance.maxLabel} has ${imbalance.maxCount} tasks — about ${Math.round(imbalance.maxCount / imbalance.avgCount)}× the team average of ${imbalance.avgCount.toFixed(1)}. Consider redistributing work.`,
      category: "workload",
    });
  }

  // Unassigned backlog
  const unassigned =
    charts.teamWorkload.find((point) => point.label === UNASSIGNED_LABEL)
      ?.value ?? 0;
  if (unassigned >= 3) {
    insights.push({
      id: "insight-unassigned",
      severity: "warning",
      title: `${unassigned} unassigned tasks`,
      message:
        "Several tasks have no assignee. Assign owners to keep Kanban flow predictable and avoid silent blockers.",
      category: "workload",
    });
  }

  // Low-progress active / at-risk projects
  const stalledProjects = charts.projectProgress.filter(
    (point) => point.value > 0 && point.value < 25,
  );
  if (stalledProjects.length > 0 && metrics.activeProjects + metrics.atRiskProjects > 0) {
    const names = stalledProjects
      .slice(0, 3)
      .map((point) => point.label)
      .join(", ");
    insights.push({
      id: "insight-low-progress",
      severity: "warning",
      title: "Projects with low progress",
      message: `${stalledProjects.length} project${stalledProjects.length === 1 ? "" : "s"} still under 25% progress (${names}${stalledProjects.length > 3 ? ", …" : ""}). Check blockers and milestones.`,
      category: "progress",
    });
  }

  // Overdue tasks (dueDate in the past, not DONE)
  const overdueCount = await prisma.task.count({
    where: {
      ...ACTIVE_TASK_WHERE,
      status: { not: TaskStatus.DONE },
      dueDate: { lt: now },
    },
  });

  if (overdueCount > 0) {
    insights.push({
      id: "insight-overdue",
      severity: overdueCount >= 5 ? "critical" : "warning",
      title: `${overdueCount} overdue task${overdueCount === 1 ? "" : "s"}`,
      message:
        overdueCount === 1
          ? "One active task is past its due date. Update the due date or escalate the blocker."
          : `${overdueCount} active tasks are past their due dates. Triage the oldest items first.`,
      category: "deadline",
    });
  }

  // Empty / thin portfolio nudge
  if (metrics.totalProjects === 0) {
    insights.push({
      id: "insight-empty-portfolio",
      severity: "info",
      title: "No active projects yet",
      message:
        "Create your first project to unlock dashboard metrics, charts, and portfolio insights.",
      category: "portfolio",
    });
  } else if (metrics.totalProjects === 1 && metrics.totalTasks === 0) {
    insights.push({
      id: "insight-no-tasks",
      severity: "info",
      title: "Add tasks to track delivery",
      message:
        "Your portfolio has a project but no tasks yet. Break work into Kanban tasks to populate analytics.",
      category: "portfolio",
    });
  }

  return {
    insights,
    generatedAt: now.toISOString(),
  };
}
