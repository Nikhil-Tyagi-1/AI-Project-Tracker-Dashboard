"use client";

import ClearIcon from "@mui/icons-material/Clear";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import {
  PRIORITY_VALUES,
  PROJECT_STATUS_VALUES,
  priorityLabels,
  projectStatusLabels,
  type Priority,
  type ProjectStatus,
} from "@/constants/enums";
import type { ProjectSortBy, SortOrder } from "@/types/project";

const SORT_OPTIONS: { value: ProjectSortBy; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "progress", label: "Progress" },
  { value: "createdAt", label: "Created date" },
  { value: "updatedAt", label: "Updated date" },
];

export type ProjectsToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  status: ProjectStatus | "";
  onStatusChange: (value: ProjectStatus | "") => void;
  priority: Priority | "";
  onPriorityChange: (value: Priority | "") => void;
  owner: string;
  onOwnerChange: (value: string) => void;
  sortBy: ProjectSortBy;
  sortOrder: SortOrder;
  onSortByChange: (value: ProjectSortBy) => void;
  onSortOrderChange: (value: SortOrder) => void;
  canReset: boolean;
  onResetFilters: () => void;
};

export function ProjectsToolbar({
  searchValue,
  onSearchChange,
  onClearSearch,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  owner,
  onOwnerChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  canReset,
  onResetFilters,
}: ProjectsToolbarProps) {
  const handleStatusChange = (event: SelectChangeEvent) => {
    onStatusChange(event.target.value as ProjectStatus | "");
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    onPriorityChange(event.target.value as Priority | "");
  };

  const handleSortByChange = (event: SelectChangeEvent) => {
    onSortByChange(event.target.value as ProjectSortBy);
  };

  return (
    <Stack spacing={2} component="section" aria-label="Project filters">
      <TextField
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search projects by name or description"
        label="Search"
        size="small"
        fullWidth
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
            md: "repeat(4, minmax(0, 1fr))",
          },
          alignItems: "start",
        }}
      >
        <FormControl size="small" fullWidth>
          <InputLabel id="projects-status-filter-label" shrink>Status</InputLabel>
          <Select
            labelId="projects-status-filter-label"
            label="Status"
            value={status}
            onChange={handleStatusChange}
            displayEmpty
            notched
          >
            <MenuItem value="">
              <em>All statuses</em>
            </MenuItem>
            {PROJECT_STATUS_VALUES.map((value) => (
              <MenuItem key={value} value={value}>
                {projectStatusLabels[value]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel id="projects-priority-filter-label" shrink>Priority</InputLabel>
          <Select
            labelId="projects-priority-filter-label"
            label="Priority"
            value={priority}
            onChange={handlePriorityChange}
            displayEmpty
            notched
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

        <TextField
          size="small"
          fullWidth
          label="Owner"
          placeholder="Filter by owner name"
          value={owner}
          onChange={(event) => onOwnerChange(event.target.value)}
        />

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", minWidth: 0 }}
        >
          <FormControl size="small" fullWidth>
            <InputLabel id="projects-sort-by-label" shrink>Sort by</InputLabel>
            <Select
              labelId="projects-sort-by-label"
              label="Sort by"
              value={sortBy}
              onChange={handleSortByChange}
              displayEmpty
              notched
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={sortOrder}
            onChange={(_, value: SortOrder | null) => {
              if (value) {
                onSortOrderChange(value);
              }
            }}
            aria-label="Sort order"
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton value="asc" aria-label="Ascending">
              Asc
            </ToggleButton>
            <ToggleButton value="desc" aria-label="Descending">
              Desc
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<FilterAltOffOutlinedIcon />}
          onClick={onResetFilters}
          disabled={!canReset}
        >
          Reset filters
        </Button>
      </Box>
    </Stack>
  );
}
