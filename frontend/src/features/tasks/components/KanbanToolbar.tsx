"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";

export type KanbanProjectOption = {
  id: string;
  name: string;
};

export type KanbanToolbarProps = {
  projectId: string;
  projects: KanbanProjectOption[];
  projectsLoading: boolean;
  onProjectChange: (projectId: string) => void;
  disabled?: boolean;
};

/**
 * Kanban board toolbar — project selector to scope the board.
 */
export function KanbanToolbar({
  projectId,
  projects,
  projectsLoading,
  onProjectChange,
  disabled = false,
}: KanbanToolbarProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onProjectChange(event.target.value);
  };

  return (
    <Stack
      component="section"
      aria-label="Kanban board filters"
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { xs: "stretch", sm: "center" } }}
    >
      <FormControl
        size="small"
        sx={{ minWidth: { xs: "100%", sm: 280 }, maxWidth: 420 }}
        disabled={disabled || projectsLoading}
      >
        <InputLabel id="kanban-project-label">Project</InputLabel>
        <Select
          labelId="kanban-project-label"
          id="kanban-project-select"
          value={
            projectId &&
            (projectsLoading || projects.some((project) => project.id === projectId))
              ? projectId
              : ""
          }
          label="Project"
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="">
            <em>Select a project</em>
          </MenuItem>
          {projectsLoading && projectId ? (
            <MenuItem value={projectId}>Loading…</MenuItem>
          ) : null}
          {projectId &&
          !projectsLoading &&
          !projects.some((project) => project.id === projectId) ? (
            <MenuItem value={projectId}>{projectId}</MenuItem>
          ) : null}
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
