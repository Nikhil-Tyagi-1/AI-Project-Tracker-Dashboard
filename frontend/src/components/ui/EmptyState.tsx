"use client";

import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { isValidElement, type ComponentType, type ReactNode } from "react";

export type EmptyStateProps = {
  /** Primary heading for the empty view. */
  title: string;
  /** Supporting copy explaining why the view is empty. */
  description?: string;
  /** Optional icon; defaults to an inbox glyph. */
  icon?: ComponentType<SvgIconProps> | ReactNode;
  /** Optional primary call-to-action. */
  actionLabel?: string;
  /** Called when the primary action button is clicked. */
  onAction?: () => void;
  /** Optional secondary action node (e.g. a link button). */
  secondaryAction?: ReactNode;
  /** Constrain max width of the copy block. */
  maxWidth?: number | string;
};

function resolveIcon(
  IconOrNode: ComponentType<SvgIconProps> | ReactNode,
  sx: SvgIconProps["sx"],
): ReactNode {
  if (IconOrNode == null || typeof IconOrNode === "boolean") {
    return null;
  }
  // MUI icons are often React.memo objects (not functions), so treat anything
  // that isn't already a renderable node as a component type.
  if (
    isValidElement(IconOrNode) ||
    typeof IconOrNode === "string" ||
    typeof IconOrNode === "number"
  ) {
    return IconOrNode;
  }
  const Icon = IconOrNode as ComponentType<SvgIconProps>;
  return <Icon aria-hidden sx={sx} />;
}

/**
 * Shared empty-state panel for lists, boards, and dashboard sections.
 */
export function EmptyState({
  title,
  description,
  icon: IconOrNode = InboxOutlinedIcon,
  actionLabel,
  onAction,
  secondaryAction,
  maxWidth = 420,
}: EmptyStateProps) {
  const iconNode = resolveIcon(IconOrNode, {
    fontSize: 48,
    color: "text.secondary",
    opacity: 0.85,
  });

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        py: { xs: 6, sm: 8 },
        px: 2,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          textAlign: "center",
          maxWidth,
          width: "100%",
        }}
      >
        {iconNode}

        <Stack spacing={0.75} sx={{ alignItems: "center" }}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 650 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Stack>

        {actionLabel && onAction ? (
          <Button variant="contained" color="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}

        {secondaryAction}
      </Stack>
    </Box>
  );
}
