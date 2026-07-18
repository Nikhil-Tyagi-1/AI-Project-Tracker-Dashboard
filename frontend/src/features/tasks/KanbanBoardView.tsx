"use client";

import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfirmDialog, EmptyState, ErrorState, useToast } from "@/components/ui";
import { appRoutes } from "@/constants/routes";
import { motionPresets } from "@/constants/motion";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { KanbanBoard } from "@/features/tasks/components/KanbanBoard";
import { KanbanBoardSkeleton } from "@/features/tasks/components/KanbanBoardSkeleton";
import {
  KanbanToolbar,
  type KanbanProjectOption,
} from "@/features/tasks/components/KanbanToolbar";
import { TaskFormDialog } from "@/features/tasks/components/TaskFormDialog";
import { useKanbanTaskMove } from "@/features/tasks/hooks/useKanbanTaskMove";
import {
  TASK_FORM_DEFAULT_VALUES,
  type TaskFormValues,
} from "@/features/tasks/taskFormSchema";
import {
  collectTaskAssignees,
  mapFormValuesToCreateInput,
  mapFormValuesToUpdateInput,
  mapTaskToFormValues,
} from "@/features/tasks/taskFormUtils";
import { getProjects } from "@/services/api/projects";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  archiveTask,
  createTask,
  DEFAULT_TASKS_FILTERS,
  fetchTasks,
  filtersToListParams,
  resetFilters,
  restoreTask,
  selectCurrentProjectId,
  selectTasks,
  selectTasksFilters,
  selectTasksListError,
  selectTasksListStatus,
  selectTasksMutationLoading,
  setAssigneeFilter,
  setCurrentProjectId,
  setIncludeArchived,
  setPriorityFilter,
  setSearchQuery,
  updateTask,
  type TasksFilterState,
} from "@/store/slices/tasksSlice";
import type { Priority } from "@/constants/enums";
import type { Project, ProjectOwner } from "@/types/project";
import type { Task } from "@/types/task";
import { getApiErrorMessage } from "@/utils/apiError";

function hasActiveBoardFilters(
  filters: TasksFilterState,
  searchInput: string,
): boolean {
  return (
    searchInput.trim() !== "" ||
    filters.priority !== DEFAULT_TASKS_FILTERS.priority ||
    filters.assigneeId !== DEFAULT_TASKS_FILTERS.assigneeId ||
    filters.includeArchived !== DEFAULT_TASKS_FILTERS.includeArchived
  );
}

/**
 * Kanban board feature view — project-scoped columns with CRUD, filters, and DnD.
 */
export function KanbanBoardView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { moveTaskTo, changeTaskStatus } = useKanbanTaskMove();

  const tasks = useAppSelector(selectTasks);
  const filters = useAppSelector(selectTasksFilters);
  const currentProjectId = useAppSelector(selectCurrentProjectId);
  const listStatus = useAppSelector(selectTasksListStatus);
  const listError = useAppSelector(selectTasksListError);
  const mutationLoading = useAppSelector(selectTasksMutationLoading);

  const [projects, setProjects] = useState<KanbanProjectOption[]>([]);
  const [projectOwners, setProjectOwners] = useState<ProjectOwner[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Task | null>(null);

  const projectIdFromUrl = searchParams.get("projectId") ?? "";

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const result = await getProjects({
        page: 1,
        pageSize: 100,
        sortBy: "name",
        sortOrder: "asc",
      });
      setProjects(
        result.data.map((project: Project) => ({
          id: project.id,
          name: project.name,
        })),
      );
      const ownersById = new Map<string, ProjectOwner>();
      for (const project of result.data) {
        ownersById.set(project.owner.id, project.owner);
      }
      setProjectOwners(
        Array.from(ownersById.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
    } catch (error) {
      setProjects([]);
      setProjectOwners([]);
      setProjectsError(
        getApiErrorMessage(error, "Failed to load projects for the board"),
      );
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (projectIdFromUrl !== currentProjectId) {
      dispatch(setCurrentProjectId(projectIdFromUrl));
    }
  }, [currentProjectId, dispatch, projectIdFromUrl]);

  useEffect(() => {
    setSearchInput("");
  }, [currentProjectId]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setSearchQuery(debouncedSearch));
    }
  }, [debouncedSearch, dispatch, filters.search]);

  useEffect(() => {
    if (!currentProjectId) {
      return;
    }
    void dispatch(fetchTasks(filtersToListParams(filters)));
  }, [currentProjectId, dispatch, filters]);

  const assigneeOptions = useMemo(
    () =>
      collectTaskAssignees(tasks, projectOwners, editingTask?.assignee ?? null),
    [editingTask?.assignee, projectOwners, tasks],
  );

  const selectedProjectName = useMemo(() => {
    return projects.find((project) => project.id === currentProjectId)?.name;
  }, [currentProjectId, projects]);

  const canReset = hasActiveBoardFilters(filters, searchInput);
  const hasQueryOrFilters =
    Boolean(filters.search.trim()) ||
    Boolean(filters.priority) ||
    Boolean(filters.assigneeId.trim()) ||
    filters.includeArchived;

  const formDefaults = useMemo(() => {
    if (formMode === "edit" && editingTask) {
      return mapTaskToFormValues(editingTask);
    }
    return { ...TASK_FORM_DEFAULT_VALUES };
  }, [editingTask, formMode]);

  const handleProjectChange = (projectId: string) => {
    setSearchInput("");
    dispatch(setCurrentProjectId(projectId));
    router.replace(
      projectId ? appRoutes.kanbanForProject(projectId) : appRoutes.kanban,
      { scroll: false },
    );
  };

  const handleClearSearch = () => {
    setSearchInput("");
    dispatch(setSearchQuery(""));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    dispatch(resetFilters());
  };

  const handleRetryTasks = () => {
    if (!currentProjectId) {
      return;
    }
    void dispatch(fetchTasks(filtersToListParams(filters)));
  };

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setFormMode("edit");
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (mutationLoading) {
      return;
    }
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleSubmitForm = async (values: TaskFormValues) => {
    if (!currentProjectId) {
      return;
    }

    try {
      if (formMode === "create") {
        const created = await dispatch(
          createTask(mapFormValuesToCreateInput(values, currentProjectId)),
        ).unwrap();
        showSuccess(`Task “${created.title}” created`);
      } else if (editingTask) {
        const updated = await dispatch(
          updateTask({
            id: editingTask.id,
            input: mapFormValuesToUpdateInput(values),
          }),
        ).unwrap();
        showSuccess(`Task “${updated.title}” updated`);
      }
      setFormOpen(false);
      setEditingTask(null);
      void dispatch(fetchTasks(filtersToListParams(filters)));
    } catch (error) {
      showError(
        typeof error === "string"
          ? error
          : formMode === "create"
            ? "Failed to create task"
            : "Failed to update task",
      );
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) {
      return;
    }

    try {
      const archived = await dispatch(archiveTask(archiveTarget.id)).unwrap();
      setArchiveTarget(null);
      showSuccess(`Task “${archived.title}” archived`);
    } catch (error) {
      showError(
        typeof error === "string" ? error : "Failed to archive task",
      );
    }
  };

  const handleRestore = async (task: Task) => {
    try {
      const restored = await dispatch(restoreTask(task.id)).unwrap();
      showSuccess(`Task “${restored.title}” restored`);
    } catch (error) {
      showError(
        typeof error === "string" ? error : "Failed to restore task",
      );
    }
  };

  const showSelectProjectPrompt = !currentProjectId;
  const showProjectsError = Boolean(projectsError) && !projectsLoading;
  const showTasksSkeleton =
    Boolean(currentProjectId) &&
    listStatus === "loading" &&
    tasks.length === 0;
  const showTasksError =
    Boolean(currentProjectId) &&
    listStatus === "failed" &&
    tasks.length === 0;
  const showTasksEmpty =
    Boolean(currentProjectId) &&
    listStatus === "succeeded" &&
    tasks.length === 0;
  const showBoard = Boolean(currentProjectId) && tasks.length > 0;

  return (
    <Box component="section" aria-labelledby="kanban-page-title">
      <Stack spacing={3}>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography
            id="kanban-page-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Kanban
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {selectedProjectName
              ? `Board for ${selectedProjectName}. Create, edit, and move tasks by status.`
              : "Select a project to view its task board by status."}
          </Typography>
        </Stack>

        <KanbanToolbar
          projectId={currentProjectId}
          projects={projects}
          projectsLoading={projectsLoading}
          onProjectChange={handleProjectChange}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onClearSearch={handleClearSearch}
          priority={filters.priority}
          onPriorityChange={(value: Priority | "") =>
            dispatch(setPriorityFilter(value))
          }
          assigneeId={filters.assigneeId}
          onAssigneeChange={(value) => dispatch(setAssigneeFilter(value))}
          assigneeOptions={assigneeOptions}
          includeArchived={filters.includeArchived}
          onIncludeArchivedChange={(value) =>
            dispatch(setIncludeArchived(value))
          }
          canReset={canReset}
          onResetFilters={handleResetFilters}
          onCreateTask={handleOpenCreate}
          disabled={Boolean(projectsError)}
          filtersDisabled={Boolean(projectsError)}
        />

        {showProjectsError ? (
          <ErrorState
            title="Could not load projects"
            message={
              projectsError ??
              "Something went wrong while loading projects for the board."
            }
            onRetry={() => {
              void loadProjects();
            }}
          />
        ) : null}

        {!showProjectsError && showSelectProjectPrompt ? (
          <EmptyState
            icon={ViewKanbanOutlinedIcon}
            title="Select a project"
            description="Choose a project above to load its Kanban board with To Do, In Progress, In Review, and Done columns."
          />
        ) : null}

        {showTasksSkeleton ? <KanbanBoardSkeleton /> : null}

        {showTasksError ? (
          <ErrorState
            title="Could not load tasks"
            message={listError ?? "Something went wrong while loading tasks."}
            onRetry={handleRetryTasks}
          />
        ) : null}

        {showTasksEmpty ? (
          hasQueryOrFilters ? (
            <EmptyState
              icon={SearchOffOutlinedIcon}
              title="No matching tasks"
              description="No tasks match your current search or filters. Try adjusting or resetting them."
              actionLabel="Reset filters"
              onAction={handleResetFilters}
            />
          ) : (
            <EmptyState
              icon={FolderOffOutlinedIcon}
              title="No tasks on this board"
              description="This project has no active tasks yet. Create a task to populate the Kanban columns."
              actionLabel="New task"
              onAction={handleOpenCreate}
            />
          )
        ) : null}

        {showBoard ? (
          <motion.div {...motionPresets.fadeUp}>
            <Stack spacing={1.5}>
              {listStatus === "loading" ? (
                <Typography variant="caption" color="text.secondary">
                  Updating board…
                </Typography>
              ) : null}

              <KanbanBoard
                tasks={tasks}
                onMoveTask={moveTaskTo}
                onStatusChange={changeTaskStatus}
                onEditTask={handleOpenEdit}
                onArchiveTask={setArchiveTarget}
                onRestoreTask={(task) => {
                  void handleRestore(task);
                }}
              />
            </Stack>
          </motion.div>
        ) : null}
      </Stack>

      <TaskFormDialog
        open={formOpen}
        mode={formMode}
        title={formMode === "create" ? "Create task" : "Edit task"}
        editingKey={editingTask?.id ?? "new"}
        defaultValues={formDefaults}
        assigneeOptions={assigneeOptions}
        isSubmitting={mutationLoading}
        assigneesLoading={projectsLoading}
        onSubmit={handleSubmitForm}
        onClose={handleCloseForm}
      />

      <ConfirmDialog
        id="archive-task"
        open={Boolean(archiveTarget)}
        title="Archive this task?"
        description={
          archiveTarget
            ? `“${archiveTarget.title}” will be removed from the default board view. You can restore it later by enabling Show archived.`
            : ""
        }
        confirmLabel="Archive task"
        cancelLabel="Cancel"
        destructive
        loading={mutationLoading}
        onConfirm={() => {
          void handleConfirmArchive();
        }}
        onCancel={() => {
          if (!mutationLoading) {
            setArchiveTarget(null);
          }
        }}
      />
    </Box>
  );
}
