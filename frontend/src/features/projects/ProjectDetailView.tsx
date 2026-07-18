"use client";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ConfirmDialog,
  ContentSkeleton,
  ErrorState,
  useToast,
} from "@/components/ui";
import { appRoutes } from "@/constants/routes";
import { ProjectMetadataSection } from "@/features/projects/components/ProjectMetadataSection";
import { ProjectTaskSummarySection } from "@/features/projects/components/ProjectTaskSummarySection";
import { summarizeTasksByStatus } from "@/features/projects/taskSummary";
import { getTasks } from "@/services/api/tasks";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  archiveProject,
  fetchProjectById,
  restoreProject,
  selectProjectsDetailError,
  selectProjectsDetailLoading,
  selectProjectsMutationLoading,
  selectSelectedProject,
} from "@/store/slices/projectsSlice";
import type { TaskStatusSummary } from "@/types/task";
import { getApiErrorMessage } from "@/utils/apiError";

export type ProjectDetailViewProps = {
  projectId: string;
};

/**
 * Project details page — metadata, task summary, edit/archive/restore actions.
 */
export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const project = useAppSelector(selectSelectedProject);
  const detailLoading = useAppSelector(selectProjectsDetailLoading);
  const detailError = useAppSelector(selectProjectsDetailError);
  const mutationLoading = useAppSelector(selectProjectsMutationLoading);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [taskSummary, setTaskSummary] = useState<TaskStatusSummary | null>(
    null,
  );
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchProjectById(projectId));
  }, [dispatch, projectId]);

  const loadTaskSummary = async (id: string) => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const result = await getTasks({
        projectId: id,
        page: 1,
        pageSize: 100,
      });
      setTaskSummary(summarizeTasksByStatus(result.data));
    } catch (error) {
      setTaskSummary(null);
      setTasksError(getApiErrorMessage(error, "Failed to load task summary"));
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    void loadTaskSummary(projectId);
  }, [projectId]);

  const handleRetryProject = () => {
    void dispatch(fetchProjectById(projectId));
  };

  const handleOpenBoard = () => {
    router.push(appRoutes.kanbanForProject(projectId));
  };

  const handleConfirmArchive = async () => {
    try {
      const archived = await dispatch(archiveProject(projectId)).unwrap();
      setArchiveDialogOpen(false);
      showSuccess(`Project “${archived.name}” archived`);
    } catch (error) {
      showError(
        typeof error === "string" ? error : "Failed to archive project",
      );
    }
  };

  const handleRestore = async () => {
    try {
      const restored = await dispatch(restoreProject(projectId)).unwrap();
      showSuccess(`Project “${restored.name}” restored`);
    } catch (error) {
      showError(
        typeof error === "string" ? error : "Failed to restore project",
      );
    }
  };

  if (detailLoading && (!project || project.id !== projectId)) {
    return (
      <Box component="section" aria-labelledby="project-detail-title">
        <Stack spacing={3}>
          <Typography
            id="project-detail-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Project details
          </Typography>
          <ContentSkeleton lines={10} aria-label="Loading project details" />
        </Stack>
      </Box>
    );
  }

  if (detailError || !project || project.id !== projectId) {
    return (
      <Box component="section" aria-labelledby="project-detail-title">
        <Stack spacing={2}>
          <Typography
            id="project-detail-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Project details
          </Typography>
          <ErrorState
            title="Could not load project"
            message={detailError ?? "The requested project could not be found."}
            onRetry={handleRetryProject}
            secondaryAction={
              <Button component={Link} href={appRoutes.projects}>
                Back to projects
              </Button>
            }
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Box component="section" aria-labelledby="project-detail-title">
      <Stack spacing={3}>
        <Stack spacing={2}>
          <Button
            component={Link}
            href={appRoutes.projects}
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Back to projects
          </Button>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "stretch", md: "flex-start" },
              justifyContent: "space-between",
            }}
          >
            <Stack spacing={1} sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}
              >
                <Typography
                  id="project-detail-title"
                  component="h1"
                  variant="h4"
                  sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
                >
                  {project.name}
                </Typography>
                {project.isArchived ? (
                  <Chip label="Archived" color="default" size="small" />
                ) : null}
              </Stack>
              {project.description ? (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxWidth: 720,
                  }}
                >
                  {project.description}
                </Typography>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No description provided.
                </Typography>
              )}
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ flexShrink: 0 }}
            >
              {!project.isArchived ? (
                <>
                  <Button
                    component={Link}
                    href={appRoutes.projectEdit(project.id)}
                    variant="contained"
                    startIcon={<EditOutlinedIcon />}
                  >
                    Edit project
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ArchiveOutlinedIcon />}
                    onClick={() => setArchiveDialogOpen(true)}
                    disabled={mutationLoading}
                  >
                    Archive
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UnarchiveOutlinedIcon />}
                  onClick={() => void handleRestore()}
                  disabled={mutationLoading}
                >
                  {mutationLoading ? "Restoring…" : "Restore project"}
                </Button>
              )}
            </Stack>
          </Stack>

          {project.isArchived ? (
            <Alert severity="warning">
              This project is archived. Restore it before editing fields or
              creating new tasks.
            </Alert>
          ) : null}
        </Stack>

        <ProjectMetadataSection project={project} />

        <ProjectTaskSummarySection
          projectId={project.id}
          summary={taskSummary}
          loading={tasksLoading}
          error={tasksError}
          onRetry={() => void loadTaskSummary(project.id)}
          onOpenBoard={handleOpenBoard}
        />
      </Stack>

      <ConfirmDialog
        id="archive-project"
        open={archiveDialogOpen}
        title="Archive this project?"
        description={`“${project.name}” will be removed from the default projects list and dashboard counts. You can restore it later.`}
        confirmLabel="Archive project"
        cancelLabel="Cancel"
        destructive
        loading={mutationLoading}
        onConfirm={() => void handleConfirmArchive()}
        onCancel={() => {
          if (!mutationLoading) {
            setArchiveDialogOpen(false);
          }
        }}
      />
    </Box>
  );
}
