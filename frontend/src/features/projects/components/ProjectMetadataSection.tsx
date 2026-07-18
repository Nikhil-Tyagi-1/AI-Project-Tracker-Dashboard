"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ProjectPriorityChip } from "@/features/projects/components/ProjectPriorityChip";
import { ProjectStatusChip } from "@/features/projects/components/ProjectStatusChip";
import type { Project } from "@/types/project";
import { formatDisplayDate } from "@/utils/formatDate";

export type ProjectMetadataSectionProps = {
  project: Project;
};

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Stack
      spacing={0.5}
      sx={{
        minWidth: 0,
        py: 1.25,
        borderBottom: 1,
        borderColor: "divider",
        "&:last-of-type": { borderBottom: 0 },
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase" }}
      >
        {label}
      </Typography>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

/**
 * Read-only project metadata block for the detail page.
 */
export function ProjectMetadataSection({
  project,
}: ProjectMetadataSectionProps) {
  return (
    <Box
      component="section"
      aria-labelledby="project-metadata-heading"
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        id="project-metadata-heading"
        component="h2"
        variant="h6"
        sx={{ fontWeight: 700, mb: 1 }}
      >
        Overview
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: { xs: 0, md: 3 },
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <Stack>
          <MetaRow label="Status">
            <ProjectStatusChip status={project.status} />
          </MetaRow>
          <MetaRow label="Priority">
            <ProjectPriorityChip priority={project.priority} />
          </MetaRow>
          <MetaRow label="Owner">
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {project.owner.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.owner.email}
            </Typography>
          </MetaRow>
          <MetaRow label="Progress">
            <Stack spacing={1}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Completion
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {project.progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                aria-label={`${project.progress}% complete`}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Stack>
          </MetaRow>
        </Stack>

        <Stack>
          <MetaRow label="Start date">
            <Typography variant="body1">
              {formatDisplayDate(project.startDate)}
            </Typography>
          </MetaRow>
          <MetaRow label="End date">
            <Typography variant="body1">
              {formatDisplayDate(project.endDate)}
            </Typography>
          </MetaRow>
          <MetaRow label="Created">
            <Typography variant="body1">
              {formatDisplayDate(project.createdAt)}
            </Typography>
          </MetaRow>
          <MetaRow label="Updated">
            <Typography variant="body1">
              {formatDisplayDate(project.updatedAt)}
            </Typography>
          </MetaRow>
        </Stack>
      </Box>

      {project.description ? (
        <Box sx={{ mt: 2.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Description
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>
            {project.description}
          </Typography>
        </Box>
      ) : null}

      <Box sx={{ mt: 2.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Risk notes
        </Typography>
        {project.riskNotes ? (
          <Typography variant="body1" sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>
            {project.riskNotes}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            No risk notes recorded.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
