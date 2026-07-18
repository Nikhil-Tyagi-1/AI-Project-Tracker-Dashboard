"use client";

import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";

import {
  PRIORITY_VALUES,
  priorityLabels,
  type Priority,
} from "@/constants/enums";
import type { TaskAssigneeOption } from "@/features/tasks/taskFormUtils";

export type KanbanProjectOption = {
  id: string;
  name: string;
};

export type KanbanToolbarProps = {
  projectId: string;
  projects: KanbanProjectOption[];
  projectsLoading: boolean;
  onProjectChange: (projectId: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  priority: Priority | "";
  onPriorityChange: (value: Priority | "") => void;
  assigneeId: string;
  onAssigneeChange: (value: string) => void;
  assigneeOptions: TaskAssigneeOption[];
  includeArchived: boolean;
  onIncludeArchivedChange: (value: boolean) => void;
  canReset: boolean;
  onResetFilters: () => void;
  onCreateTask?: () => void;
  disabled?: boolean;
  filtersDisabled?: boolean;
};

/**
 * Kanban board toolbar — project scope, search, priority/assignee filters, create CTA.
 */
export function KanbanToolbar({
  projectId,
  projects,
  projectsLoading,
  onProjectChange,
  searchValue,
  onSearchChange,
  onClearSearch,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeChange,
  assigneeOptions,
  includeArchived,
  onIncludeArchivedChange,
  canReset,
  onResetFilters,
  onCreateTask,
  disabled = false,
  filtersDisabled = false,
}: KanbanToolbarProps) {
  const handleProjectChange = (event: SelectChangeEvent) => {
    onProjectChange(event.target.value);
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    onPriorityChange(event.target.value as Priority | "");
  };

  const handleAssigneeChange = (event: SelectChangeEvent) => {
    onAssigneeChange(event.target.value);
  };

  const boardScoped = Boolean(projectId) && !filtersDisabled;

  return (
    <Stack spacing={2} component="section" aria-label="Kanban board filters">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
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
              (projectsLoading ||
                projects.some((project) => project.id === projectId))
                ? projectId
                : ""
            }
            label="Project"
            onChange={handleProjectChange}
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

        {onCreateTask ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreateTask}
            disabled={!boardScoped}
            sx={{ alignSelf: { xs: "stretch", sm: "center" }, flexShrink: 0 }}
          >
            New task
          </Button>
        ) : null}
      </Stack>

      <TextField
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search tasks by title"
        label="Search"
        size="small"
        fullWidth
        disabled={!boardScoped}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" aria-hidden />
              </InputAdornment>
            ),
            endAdornment: searchValue ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear search"
                  edge="end"
                  size="small"
                  onClick={onClearSearch}
                  disabled={!boardScoped}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr auto",
          },
          alignItems: "center",
        }}
      >
        <FormControl size="small" fullWidth disabled={!boardScoped}>
          <InputLabel id="kanban-priority-filter-label">Priority</InputLabel>
          <Select
            labelId="kanban-priority-filter-label"
            label="Priority"
            value={priority}
            onChange={handlePriorityChange}
            displayEmpty
          >
            <MenuItem value="">
              <em>All priorities</em>
            </MenuItem>
            {PRIORITY_VALUES.map((value) => (
              <MenuItem key={value} value={value}>
                {priorityLabels[value]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth disabled={!boardScoped}>
          <InputLabel id="kanban-assignee-filter-label">Assignee</InputLabel>
          <Select
            labelId="kanban-assignee-filter-label"
            label="Assignee"
            value={assigneeId}
            onChange={handleAssigneeChange}
            displayEmpty
          >
            <MenuItem value="">
              <em>All assignees</em>
            </MenuItem>
            {assigneeOptions.map((assignee) => (
              <MenuItem key={assignee.id} value={assignee.id}>
                {assignee.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={includeArchived}
              onChange={(event) =>
                onIncludeArchivedChange(event.target.checked)
              }
              disabled={!boardScoped}
              size="small"
            />
          }
          label="Show archived"
          sx={{ m: 0, justifySelf: { xs: "start", md: "center" } }}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<FilterAltOffOutlinedIcon />}
          onClick={onResetFilters}
          disabled={!canReset || !boardScoped}
        >
          Reset filters
        </Button>
      </Box>
    </Stack>
  );
}
