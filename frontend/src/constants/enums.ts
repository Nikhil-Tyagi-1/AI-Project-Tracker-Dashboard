/**
 * Domain enums aligned with backend Prisma enums and validators (spec.md §8).
 * Soft-archive is a separate flag/action — not a status enum value.
 *
 * Value arrays mirror backend `PROJECT_STATUS_VALUES`, `TASK_STATUS_VALUES`,
 * and `PRIORITY_VALUES` for consistent client/server validation.
 */

export const PROJECT_STATUS_VALUES = [
  "PLANNED",
  "IN_PROGRESS",
  "ON_HOLD",
  "AT_RISK",
  "COMPLETED",
] as const;

export const ProjectStatus = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  ON_HOLD: "ON_HOLD",
  AT_RISK: "AT_RISK",
  COMPLETED: "COMPLETED",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const TASK_STATUS_VALUES = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

/** Kanban column order must match this sequence left-to-right (spec.md §8.3). */
export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const Priority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

/** Human-readable labels for selects, chips, and filters. */
export const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  AT_RISK: "At Risk",
  COMPLETED: "Completed",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

export const projectStatusOptions: SelectOption<ProjectStatus>[] =
  PROJECT_STATUS_VALUES.map((value) => ({
    value,
    label: projectStatusLabels[value],
  }));

export const taskStatusOptions: SelectOption<TaskStatus>[] =
  TASK_STATUS_VALUES.map((value) => ({
    value,
    label: taskStatusLabels[value],
  }));

export const priorityOptions: SelectOption<Priority>[] = PRIORITY_VALUES.map(
  (value) => ({
    value,
    label: priorityLabels[value],
  }),
);
