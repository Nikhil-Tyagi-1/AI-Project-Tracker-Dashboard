"use client";

import Chip from "@mui/material/Chip";

import {
  ProjectStatus,
  projectStatusLabels,
  type ProjectStatus as ProjectStatusType,
} from "@/constants/enums";
import { colorTokens } from "@/theme/tokens";

const statusColors: Record<ProjectStatusType, string> = {
  [ProjectStatus.PLANNED]: colorTokens.status.planned,
  [ProjectStatus.IN_PROGRESS]: colorTokens.status.inProgress,
  [ProjectStatus.ON_HOLD]: colorTokens.status.onHold,
  [ProjectStatus.AT_RISK]: colorTokens.status.atRisk,
  [ProjectStatus.COMPLETED]: colorTokens.status.completed,
};

export type ProjectStatusChipProps = {
  status: ProjectStatusType;
  size?: "small" | "medium";
};

export function ProjectStatusChip({
  status,
  size = "small",
}: ProjectStatusChipProps) {
  const color = statusColors[status];

  return (
    <Chip
      label={projectStatusLabels[status]}
      size={size}
      variant="outlined"
      sx={{
        borderColor: color,
        color,
        fontWeight: 600,
        bgcolor: "transparent",
      }}
    />
  );
}
