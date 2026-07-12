/**
 * Domain enums aligned with backend contracts (spec.md §8).
 * Soft-archive is a separate flag/action — not a status enum value.
 */
export const ProjectStatus = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  ON_HOLD: "ON_HOLD",
  AT_RISK: "AT_RISK",
  COMPLETED: "COMPLETED",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const Priority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];
