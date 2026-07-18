"use client";

import Chip from "@mui/material/Chip";

import {
  Priority,
  priorityLabels,
  type Priority as PriorityType,
} from "@/constants/enums";
import { semanticChipSx } from "@/features/projects/components/semanticChipSx";
import { colorTokens } from "@/theme/tokens";

const priorityColors: Record<PriorityType, string> = {
  [Priority.LOW]: colorTokens.priority.low,
  [Priority.MEDIUM]: colorTokens.priority.medium,
  [Priority.HIGH]: colorTokens.priority.high,
  [Priority.CRITICAL]: colorTokens.priority.critical,
};

export type ProjectPriorityChipProps = {
  priority: PriorityType;
  size?: "small" | "medium";
};

export function ProjectPriorityChip({
  priority,
  size = "small",
}: ProjectPriorityChipProps) {
  const color = priorityColors[priority];

  return (
    <Chip
      label={priorityLabels[priority]}
      size={size}
      sx={{
        ...semanticChipSx,
        bgcolor: color,
        color: "#FFFFFF",
      }}
    />
  );
}
