"use client";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ContentSkeleton, ErrorState, useToast } from "@/components/ui";
import { appRoutes } from "@/constants/routes";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import type { ProjectFormValues } from "@/features/projects/projectFormSchema";
import {
  collectProjectOwners,
  mapFormValuesToUpdateInput,
  mapProjectToFormValues,
} from "@/features/projects/projectFormUtils";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchProjectById,
  fetchProjects,
  selectProjects,
  selectProjectsDetailError,
  selectProjectsDetailLoading,
  selectProjectsMutationLoading,
  selectSelectedProject,
  updateProject,
} from "@/store/slices/projectsSlice";

export type ProjectEditViewProps = {
  projectId: string;
};

/**
 * Edit-project page view — loads project, reuses ProjectForm, saves via Redux.
 */
export function ProjectEditView({ projectId }: ProjectEditViewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const project = useAppSelector(selectSelectedProject);
  const projects = useAppSelector(selectProjects);
  const detailLoading = useAppSelector(selectProjectsDetailLoading);
  const detailError = useAppSelector(selectProjectsDetailError);
  const isSubmitting = useAppSelector(selectProjectsMutationLoading);

  useEffect(() => {
    void dispatch(fetchProjectById(projectId));
    void dispatch(fetchProjects({ pageSize: 100, page: 1 }));
  }, [dispatch, projectId]);

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      const updated = await dispatch(
        updateProject({
          id: projectId,
          input: mapFormValuesToUpdateInput(values),
        }),
      ).unwrap();
      showSuccess(`Project “${updated.name}” updated`);
      router.push(appRoutes.projectDetail(updated.id));
    } catch (error) {
      showError(
        typeof error === "string" ? error : "Failed to update project",
      );
    }
  };

  const handleCancel = () => {
    router.push(appRoutes.projectDetail(projectId));
  };

  const handleRetry = () => {
    void dispatch(fetchProjectById(projectId));
  };

  if (detailLoading && (!project || project.id !== projectId)) {
    return (
      <Box component="section" aria-labelledby="edit-project-title">
        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Typography
            id="edit-project-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Edit project
          </Typography>
          <ContentSkeleton lines={8} aria-label="Loading project" />
        </Stack>
      </Box>
    );
  }

  if (detailError || !project || project.id !== projectId) {
    return (
      <Box component="section" aria-labelledby="edit-project-title">
        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          <Typography
            id="edit-project-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Edit project
          </Typography>
          <ErrorState
            title="Could not load project"
            message={detailError ?? "The requested project could not be found."}
            onRetry={handleRetry}
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

  const ownerOptions = collectProjectOwners(projects, project.owner);

  return (
    <Box component="section" aria-labelledby="edit-project-title">
      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        <Stack spacing={1.5}>
          <Button
            component={Link}
            href={appRoutes.projectDetail(projectId)}
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Back to project
          </Button>
          <Typography
            id="edit-project-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Edit project
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update metadata for{" "}
            <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              {project.name}
            </Box>
            .
          </Typography>
        </Stack>

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
            p: { xs: 2, sm: 3 },
          }}
        >
          <ProjectForm
            key={project.id}
            mode="edit"
            defaultValues={mapProjectToFormValues(project)}
            currentStatus={project.status}
            ownerOptions={ownerOptions}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Box>
      </Stack>
    </Box>
  );
}
