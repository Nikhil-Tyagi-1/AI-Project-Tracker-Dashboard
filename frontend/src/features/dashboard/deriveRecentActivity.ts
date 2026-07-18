import { appRoutes } from "@/constants/routes";
import type { ActivityItem } from "@/types/dashboard";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

const DEFAULT_LIMIT = 10;

function isSameInstant(a: string, b: string): boolean {
  return new Date(a).getTime() === new Date(b).getTime();
}

/**
 * Build a recent-activity feed from project/task timestamps.
 * Spec FR-D02 allows deriving this when a dedicated activity log is deferred.
 */
export function deriveRecentActivity(
  projects: Project[],
  tasks: Task[],
  limit = DEFAULT_LIMIT,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const project of projects) {
    items.push({
      id: `project-created-${project.id}`,
      entityType: "project",
      action: "created",
      title: project.name,
      subtitle: `Owned by ${project.owner.name}`,
      href: appRoutes.projectDetail(project.id),
      occurredAt: project.createdAt,
    });

    if (!isSameInstant(project.createdAt, project.updatedAt)) {
      items.push({
        id: `project-updated-${project.id}`,
        entityType: "project",
        action: "updated",
        title: project.name,
        subtitle: `Owned by ${project.owner.name}`,
        href: appRoutes.projectDetail(project.id),
        occurredAt: project.updatedAt,
      });
    }
  }

  for (const task of tasks) {
    items.push({
      id: `task-created-${task.id}`,
      entityType: "task",
      action: "created",
      title: task.title,
      subtitle: task.project.name,
      href: appRoutes.kanbanForProject(task.projectId),
      occurredAt: task.createdAt,
    });

    if (!isSameInstant(task.createdAt, task.updatedAt)) {
      items.push({
        id: `task-updated-${task.id}`,
        entityType: "task",
        action: "updated",
        title: task.title,
        subtitle: task.project.name,
        href: appRoutes.kanbanForProject(task.projectId),
        occurredAt: task.updatedAt,
      });
    }
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, limit);
}
