"use client";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ContentSkeleton, useToast } from "@/components/ui";
import { appRoutes } from "@/constants/routes";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import {
  PROJECT_FORM_DEFAULT_VALUES,
  type ProjectFormValues,
} from "@/features/projects/projectFormSchema";
import {
  collectProjectOwners,
  mapFormValuesToCreateInput,
} from "@/features/projects/projectFormUtils";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  createProject,
  fetchProjects,
  selectProjects,
  selectProjectsMutationLoading,
} from "@/store/slices/projectsSlice";

/**
 * Create-project page view — shared ProjectForm + Redux create thunk.
 */
export function ProjectCreateView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const projects = useAppSelector(selectProjects);
  const isSubmitting = useAppSelector(selectProjectsMutationLoading);

  const [ownersReady, setOwnersReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadOwners = async () => {
      try {
        await dispatch(fetchProjects({ pageSize: 100, page: 1 })).unwrap();
      } catch {
        // Owner select can still work from any cached projects; form validates ownerId.
      } finally {
        if (!cancelled) {
          setOwnersReady(true);
        }
      }
    };

    void loadOwners();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const ownerOptions = collectProjectOwners(projects);

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      const project = await dispatch(
        createProject(mapFormValuesToCreateInput(values)),
      ).unwrap();
      showSuccess(`Project “${project.name}” created`);
      router.push(appRoutes.projectDetail(project.id));
    } catch (error) {
      showError(
        typeof error === "string" ? error : "Failed to create project",
      );
    }
  };

  const handleCancel = () => {
    router.push(appRoutes.projects);
  };

  return (
    <Box component="section" aria-labelledby="create-project-title">
      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        <Stack spacing={1.5}>
          <Button
            component={Link}
            href={appRoutes.projects}
            startIcon={<ArrowBackOutlinedIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Back to projects
          </Button>
          <Typography
            id="create-project-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            New project
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Capture ownership, status, and timeline for a new initiative.
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
          {!ownersReady ? (
            <ContentSkeleton lines={8} aria-label="Loading project form" />
          ) : (
            <ProjectForm
              mode="create"
              defaultValues={{
                ...PROJECT_FORM_DEFAULT_VALUES,
                ownerId: ownerOptions[0]?.id ?? "",
              }}
              ownerOptions={ownerOptions}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
}
