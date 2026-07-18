"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ProjectPriorityChip } from "@/features/projects/components/ProjectPriorityChip";
import { ProjectStatusChip } from "@/features/projects/components/ProjectStatusChip";
import type { Project } from "@/types/project";
import { formatDisplayDate } from "@/utils/formatDate";

export type ProjectsCardListProps = {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
};

export function ProjectsCardList({
  projects,
  onProjectClick,
}: ProjectsCardListProps) {
  return (
    <Stack
      spacing={1.5}
      component="ul"
      aria-label="Projects list"
      sx={{ listStyle: "none", m: 0, p: 0 }}
    >
      {projects.map((project) => (
        <Box
          key={project.id}
          component="li"
          role="button"
          tabIndex={0}
          onClick={() => onProjectClick(project.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onProjectClick(project.id);
            }
          }}
          aria-label={`Open project ${project.name}`}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
            p: 2,
            cursor: "pointer",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease",
            "&:hover": {
              borderColor: "primary.light",
              boxShadow: 2,
            },
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            },
          }}
        >
          <Stack spacing={1.5}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {project.name}
              </Typography>
              {project.description ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {project.description}
                </Typography>
              ) : null}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <ProjectStatusChip status={project.status} />
              <ProjectPriorityChip priority={project.priority} />
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "space-between", flexWrap: "wrap" }}
            >
              <Typography variant="body2" color="text.secondary">
                Owner:{" "}
                <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                  {project.owner.name}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated {formatDisplayDate(project.updatedAt)}
              </Typography>
            </Stack>

            <Box>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", mb: 0.75 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {project.progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                aria-label={`${project.progress}% complete`}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
