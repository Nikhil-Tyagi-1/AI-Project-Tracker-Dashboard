import type { DashboardInsights, DashboardSummary } from "@/types/dashboard";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

/** Seeded summary payload used across Dashboard / Analytics smoke tests. */
export const seededDashboardSummary: DashboardSummary = {
  metrics: {
    totalProjects: 5,
    activeProjects: 1,
    completedProjects: 1,
    atRiskProjects: 1,
    totalTasks: 27,
    completedTasks: 10,
    pendingTasks: 17,
    completionPercentage: 37,
  },
  charts: {
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
      { label: "2026-03", created: 4, updated: 0 },
      { label: "2026-04", created: 5, updated: 0 },
      { label: "2026-05", created: 7, updated: 0 },
      { label: "2026-06", created: 13, updated: 0 },
      { label: "2026-07", created: 0, updated: 8 },
    ],
  },
};

/** Empty portfolio summary — zeros + empty/zero chart series. */
export const emptyDashboardSummary: DashboardSummary = {
  metrics: {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    atRiskProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionPercentage: 0,
  },
  charts: {
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
  },
};

export const seededDashboardInsights: DashboardInsights = {
  insights: [
    {
      id: "insight-at-risk",
      severity: "warning",
      title: "1 project at risk",
      message: "One project is marked AT_RISK. Review risk notes.",
      category: "risk",
    },
    {
      id: "insight-low-completion",
      severity: "warning",
      title: "Task completion is behind",
      message: "Only 37% of tasks are done (10 of 27).",
      category: "progress",
    },
  ],
  generatedAt: "2026-07-18T08:30:00.000Z",
};

export const sampleActivityProject: Project = {
  id: "proj-1",
  name: "Customer Portal Redesign",
  description: null,
  status: "IN_PROGRESS",
  priority: "HIGH",
  progress: 45,
  ownerId: "user-1",
  owner: { id: "user-1", name: "Alex Morgan", email: "alex@example.com" },
  startDate: null,
  endDate: null,
  riskNotes: null,
  isArchived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-07-10T12:00:00.000Z",
};

export const sampleActivityTask: Task = {
  id: "task-1",
  title: "Draft wireframes",
  description: null,
  status: "IN_PROGRESS",
  priority: "MEDIUM",
  dueDate: null,
  sortOrder: 0,
  projectId: "proj-1",
  project: {
    id: "proj-1",
    name: "Customer Portal Redesign",
    isArchived: false,
  },
  assigneeId: null,
  assignee: null,
  isArchived: false,
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-07-11T09:00:00.000Z",
};
