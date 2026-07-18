import type { TaskFormValues } from "@/features/tasks/taskFormSchema";
import type { ProjectOwner } from "@/types/project";
import type {
  CreateTaskInput,
  Task,
  TaskAssignee,
  UpdateTaskInput,
} from "@/types/task";

export type TaskAssigneeOption = {
  id: string;
  name: string;
  email?: string;
};

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

export function mapTaskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId ?? "",
    dueDate: toDateInputValue(task.dueDate),
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
  values: TaskFormValues,
  projectId: string,
): CreateTaskInput {
  return {
    title: values.title.trim(),
    projectId,
    description: optionalText(values.description),
    status: values.status,
    priority: values.priority,
    ...(values.assigneeId.trim()
      ? { assigneeId: values.assigneeId.trim() }
      : {}),
    dueDate: optionalDate(values.dueDate),
  };
}

/**
 * Full-form update payload. Empty optional fields clear via `null`
 * (matches backend update schema nullish clearing).
 */
export function mapFormValuesToUpdateInput(
  values: TaskFormValues,
): UpdateTaskInput {
  return {
    title: values.title.trim(),
    description: optionalText(values.description) ?? null,
    status: values.status,
    priority: values.priority,
    assigneeId: values.assigneeId.trim() ? values.assigneeId.trim() : null,
    dueDate: optionalDate(values.dueDate) ?? null,
  };
}

/**
 * Unique assignees from project owners and task assignees.
 * Optionally merge an extra assignee (edit mode / current selection).
 */
export function collectTaskAssignees(
  tasks: Task[],
  projectOwners: ProjectOwner[] = [],
  extra?: TaskAssignee | TaskAssigneeOption | null,
): TaskAssigneeOption[] {
  const byId = new Map<string, TaskAssigneeOption>();

  for (const owner of projectOwners) {
    byId.set(owner.id, {
      id: owner.id,
      name: owner.name,
      email: owner.email,
    });
  }

  for (const task of tasks) {
    if (task.assignee) {
      byId.set(task.assignee.id, {
        id: task.assignee.id,
        name: task.assignee.name,
        email: task.assignee.email,
      });
    }
  }

  if (extra) {
    byId.set(extra.id, {
      id: extra.id,
      name: extra.name,
      email: "email" in extra ? extra.email : undefined,
    });
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
