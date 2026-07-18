"use client";

import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { ProjectPriorityChip } from "@/features/projects/components/ProjectPriorityChip";
import { ProjectStatusChip } from "@/features/projects/components/ProjectStatusChip";
import type { Project, ProjectSortBy, SortOrder } from "@/types/project";
import { formatDisplayDate } from "@/utils/formatDate";

type SortableColumn = Extract<
  ProjectSortBy,
  "name" | "progress" | "createdAt" | "updatedAt"
>;

const COLUMNS: {
  id: SortableColumn | "status" | "priority" | "owner";
  label: string;
  sortable?: SortableColumn;
  width?: string;
}[] = [
  { id: "name", label: "Name", sortable: "name" },
  { id: "status", label: "Status", width: "140px" },
  { id: "priority", label: "Priority", width: "120px" },
  { id: "owner", label: "Owner", width: "150px" },
  { id: "progress", label: "Progress", sortable: "progress", width: "140px" },
  {
    id: "createdAt",
    label: "Created",
    sortable: "createdAt",
    width: "120px",
  },
  {
    id: "updatedAt",
    label: "Updated",
    sortable: "updatedAt",
    width: "120px",
  },
];

export type ProjectsTableProps = {
  projects: Project[];
  sortBy: ProjectSortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: ProjectSortBy) => void;
  onProjectClick: (projectId: string) => void;
};

export function ProjectsTable({
  projects,
  sortBy,
  sortOrder,
  onSortChange,
  onProjectClick,
}: ProjectsTableProps) {
  const handleSort = (column: SortableColumn) => {
    onSortChange(column);
  };

  return (
    <TableContainer
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <Table aria-label="Projects table" size="medium">
        <TableHead>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableCell
                key={column.id}
                sortDirection={
                  column.sortable && sortBy === column.sortable
                    ? sortOrder
                    : false
                }
                sx={{ width: column.width, fontWeight: 700 }}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={sortBy === column.sortable}
                    direction={
                      sortBy === column.sortable ? sortOrder : "asc"
                    }
                    onClick={() => handleSort(column.sortable!)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              hover
              tabIndex={0}
              onClick={() => onProjectClick(project.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onProjectClick(project.id);
                }
              }}
              sx={{
                cursor: "pointer",
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: -2,
                },
              }}
              aria-label={`Open project ${project.name}`}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {project.name}
                </Typography>
                {project.description ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {project.description}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell>
                <ProjectStatusChip status={project.status} />
              </TableCell>
              <TableCell>
                <ProjectPriorityChip priority={project.priority} />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{project.owner.name}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    aria-label={`${project.progress}% complete`}
                    sx={{ flex: 1, height: 6, borderRadius: 1 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: 36, textAlign: "right" }}
                  >
                    {project.progress}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDisplayDate(project.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDisplayDate(project.updatedAt)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
