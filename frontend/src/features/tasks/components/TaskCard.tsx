"use client";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useId, useState, type MouseEvent } from "react";

import {
  TASK_STATUS_VALUES,
  taskStatusLabels,
  type TaskStatus,
} from "@/constants/enums";
import { ProjectPriorityChip } from "@/features/projects/components/ProjectPriorityChip";
import { colorTokens } from "@/theme/tokens";
import type { Task } from "@/types/task";
import { formatDisplayDate } from "@/utils/formatDate";

const statusAccent: Record<TaskStatus, string> = {
  TODO: colorTokens.status.todo,
  IN_PROGRESS: colorTokens.status.inProgress,
  IN_REVIEW: colorTokens.status.inReview,
  DONE: colorTokens.status.done,
};

export type TaskCardProps = {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onArchive: (task: Task) => void;
  onRestore: (task: Task) => void;
  disabled?: boolean;
};

/**
 * Draggable Kanban task card with accessible edit / archive / status actions.
 */
export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onArchive,
  onRestore,
  disabled = false,
}: TaskCardProps) {
  const menuId = useId();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
    disabled: disabled || task.isArchived,
  });

  const assigneeLabel = task.assignee?.name ?? "Unassigned";
  const dueDateLabel = formatDisplayDate(task.dueDate);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleSelectStatus = (status: TaskStatus) => {
    handleCloseMenu();
    if (status !== task.status) {
      onStatusChange(task.id, status);
    }
  };

  return (
    <Box
      ref={setNodeRef}
      component="article"
      aria-label={`Task: ${task.title}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      sx={{
        border: 1,
        borderColor: isDragging ? "primary.main" : "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        p: 1.5,
        opacity: isDragging ? 0.55 : task.isArchived ? 0.72 : 1,
        boxShadow: isDragging ? 4 : 0,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: isDragging ? 4 : 1,
        },
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "flex-start", minWidth: 0, flex: 1 }}
          >
            <IconButton
              ref={setActivatorNodeRef}
              {...listeners}
              {...attributes}
              size="small"
              aria-label={`Drag ${task.title}`}
              disabled={disabled || task.isArchived}
              sx={{
                mt: -0.5,
                ml: -0.75,
                cursor:
                  disabled || task.isArchived ? "default" : "grab",
                touchAction: "none",
                "&:active": {
                  cursor:
                    disabled || task.isArchived ? "default" : "grabbing",
                },
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </IconButton>

            <Stack spacing={0.5} sx={{ minWidth: 0, pt: 0.25 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                }}
              >
                {task.title}
              </Typography>
              {task.isArchived ? (
                <Chip label="Archived" size="small" sx={{ alignSelf: "flex-start" }} />
              ) : null}
            </Stack>
          </Stack>

          <IconButton
            size="small"
            aria-label={`Actions for ${task.title}`}
            aria-controls={menuOpen ? menuId : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={handleOpenMenu}
            disabled={disabled}
            sx={{ mt: -0.5, mr: -0.75 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <ProjectPriorityChip priority={task.priority} size="small" />

        <Stack spacing={0.75}>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <PersonOutlineOutlinedIcon
              fontSize="small"
              color="action"
              aria-hidden
              sx={{ flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              title={assigneeLabel}
            >
              {assigneeLabel}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <EventOutlinedIcon
              fontSize="small"
              color="action"
              aria-hidden
              sx={{ flexShrink: 0 }}
            />
            <Typography variant="caption" color="text.secondary">
              {dueDateLabel}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Menu
        id={menuId}
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          list: {
            "aria-label": `Actions for ${task.title}`,
            dense: true,
          },
        }}
      >
        {!task.isArchived ? (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onEdit(task);
            }}
          >
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit task</ListItemText>
          </MenuItem>
        ) : null}

        {task.isArchived ? (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onRestore(task);
            }}
          >
            <ListItemIcon>
              <UnarchiveOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Restore task</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              onArchive(task);
            }}
          >
            <ListItemIcon>
              <ArchiveOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Archive task</ListItemText>
          </MenuItem>
        )}

        {!task.isArchived ? (
          <>
            <Divider />
            {TASK_STATUS_VALUES.map((status) => (
              <MenuItem
                key={status}
                selected={status === task.status}
                onClick={() => handleSelectStatus(status)}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Box
                    aria-hidden
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: statusAccent[status],
                    }}
                  />
                </ListItemIcon>
                <ListItemText>{taskStatusLabels[status]}</ListItemText>
              </MenuItem>
            ))}
          </>
        ) : null}
      </Menu>
    </Box>
  );
}
