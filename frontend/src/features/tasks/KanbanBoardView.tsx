"use client";

import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState, ErrorState } from "@/components/ui";
import { appRoutes } from "@/constants/routes";
import { motionPresets } from "@/constants/motion";
import { KanbanBoard } from "@/features/tasks/components/KanbanBoard";
import { KanbanBoardSkeleton } from "@/features/tasks/components/KanbanBoardSkeleton";
import {
  KanbanToolbar,
  type KanbanProjectOption,
} from "@/features/tasks/components/KanbanToolbar";
import { useKanbanTaskMove } from "@/features/tasks/hooks/useKanbanTaskMove";
import { getProjects } from "@/services/api/projects";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchTasks,
  filtersToListParams,
  selectCurrentProjectId,
  selectTasks,
  selectTasksFilters,
  selectTasksListError,
  selectTasksListStatus,
  setCurrentProjectId,
} from "@/store/slices/tasksSlice";
import { getApiErrorMessage } from "@/utils/apiError";

/**
 * Kanban board feature view — project-scoped columns with optimistic drag-and-drop.
 */
export function KanbanBoardView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { moveTaskTo, changeTaskStatus } = useKanbanTaskMove();

  const tasks = useAppSelector(selectTasks);
  const filters = useAppSelector(selectTasksFilters);
  const currentProjectId = useAppSelector(selectCurrentProjectId);
  const listStatus = useAppSelector(selectTasksListStatus);
  const listError = useAppSelector(selectTasksListError);

  const [projects, setProjects] = useState<KanbanProjectOption[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

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
        result.data.map((project) => ({
          id: project.id,
          name: project.name,
        })),
      );
    } catch (error) {
      setProjects([]);
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
    if (!currentProjectId) {
      return;
    }
    void dispatch(fetchTasks(filtersToListParams(filters)));
  }, [currentProjectId, dispatch, filters]);

  const selectedProjectName = useMemo(() => {
    return projects.find((project) => project.id === currentProjectId)?.name;
  }, [currentProjectId, projects]);

  const handleProjectChange = (projectId: string) => {
    dispatch(setCurrentProjectId(projectId));
    router.replace(
      projectId ? appRoutes.kanbanForProject(projectId) : appRoutes.kanban,
      { scroll: false },
    );
  };

  const handleRetryTasks = () => {
    if (!currentProjectId) {
      return;
    }
    void dispatch(fetchTasks(filtersToListParams(filters)));
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
              ? `Board for ${selectedProjectName}. Select another project to switch context.`
              : "Select a project to view its task board by status."}
          </Typography>
        </Stack>

        <KanbanToolbar
          projectId={currentProjectId}
          projects={projects}
          projectsLoading={projectsLoading}
          onProjectChange={handleProjectChange}
          disabled={Boolean(projectsError)}
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
          <EmptyState
            icon={FolderOffOutlinedIcon}
            title="No tasks on this board"
            description="This project has no active tasks yet. Create tasks to populate the Kanban columns."
          />
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
              />
            </Stack>
          </motion.div>
        ) : null}
      </Stack>
    </Box>
  );
}
