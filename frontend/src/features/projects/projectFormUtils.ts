import type { ProjectStatus } from "@/constants/enums";
import type { ProjectFormValues } from "@/features/projects/projectFormSchema";
import type {
  CreateProjectInput,
  Project,
  ProjectOwner,
  UpdateProjectInput,
} from "@/types/project";

/**
 * Allowed status transitions (mirrors backend ProjectService / spec.md §8.1).
 * Same-status is always allowed and included by helpers below.
 */
export const PROJECT_STATUS_TRANSITIONS: Record<
  ProjectStatus,
  readonly ProjectStatus[]
> = {
  PLANNED: ["IN_PROGRESS", "ON_HOLD", "AT_RISK", "COMPLETED"],
  IN_PROGRESS: ["PLANNED", "ON_HOLD", "AT_RISK", "COMPLETED"],
  ON_HOLD: ["PLANNED", "IN_PROGRESS", "AT_RISK", "COMPLETED"],
  AT_RISK: ["PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"],
  COMPLETED: ["PLANNED", "IN_PROGRESS"],
};

/** Status options valid for create, or for edit from `currentStatus`. */
export function getSelectableProjectStatuses(
  currentStatus?: ProjectStatus,
): ProjectStatus[] {
  if (!currentStatus) {
    return [
      "PLANNED",
      "IN_PROGRESS",
      "ON_HOLD",
      "AT_RISK",
      "COMPLETED",
    ];
  }

  const allowed = PROJECT_STATUS_TRANSITIONS[currentStatus] ?? [];
  return [currentStatus, ...allowed.filter((status) => status !== currentStatus)];
}

/** Convert API ISO datetime to `yyyy-MM-dd` for `<input type="date">`. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return value.slice(0, 10);
}

export function mapProjectToFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    description: project.description ?? "",
    ownerId: project.ownerId,
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    startDate: toDateInputValue(project.startDate),
    endDate: toDateInputValue(project.endDate),
    riskNotes: project.riskNotes ?? "",
  };
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalDate(value: string): string | undefined {
  return value.trim() ? value.trim() : undefined;
}

export function mapFormValuesToCreateInput(
  values: ProjectFormValues,
): CreateProjectInput {
  return {
    name: values.name.trim(),
    ownerId: values.ownerId,
    description: optionalText(values.description),
    status: values.status,
    priority: values.priority,
    progress: values.progress,
    startDate: optionalDate(values.startDate),
    endDate: optionalDate(values.endDate),
    riskNotes: optionalText(values.riskNotes),
  };
}

/**
 * Full-form update payload. Empty optional fields clear via `null`
 * (matches backend update schema nullish clearing).
 */
export function mapFormValuesToUpdateInput(
  values: ProjectFormValues,
): UpdateProjectInput {
  return {
    name: values.name.trim(),
    ownerId: values.ownerId,
    description: optionalText(values.description) ?? null,
    status: values.status,
    priority: values.priority,
    progress: values.progress,
    startDate: optionalDate(values.startDate) ?? null,
    endDate: optionalDate(values.endDate) ?? null,
    riskNotes: optionalText(values.riskNotes) ?? null,
  };
}

/** Unique owners from projects, optionally including an extra owner (edit mode). */
export function collectProjectOwners(
  projects: Project[],
  extra?: ProjectOwner | null,
): ProjectOwner[] {
  const byId = new Map<string, ProjectOwner>();

  for (const project of projects) {
    byId.set(project.owner.id, project.owner);
  }

  if (extra) {
    byId.set(extra.id, extra);
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
