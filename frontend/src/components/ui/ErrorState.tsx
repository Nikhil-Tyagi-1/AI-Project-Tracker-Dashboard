"use client";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { isValidElement, type ComponentType, type ReactNode } from "react";

export type ErrorStateProps = {
  /** Primary heading for the error view. */
  title?: string;
  /** Human-readable error details or recovery hint. */
  message: string;
  /** Optional icon; defaults to an error outline glyph. */
  icon?: ComponentType<SvgIconProps> | ReactNode;
  /** Label for the retry control. */
  retryLabel?: string;
  /** Called when the user chooses to retry. */
  onRetry?: () => void;
  /** Optional secondary action (e.g. go back). */
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
 * Shared error-state panel for failed loads and recoverable section errors.
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  icon: IconOrNode = ErrorOutlineOutlinedIcon,
  retryLabel = "Try again",
  onRetry,
  secondaryAction,
  maxWidth = 420,
}: ErrorStateProps) {
  const iconNode = resolveIcon(IconOrNode, {
    fontSize: 48,
    color: "error.main",
    opacity: 0.9,
  });

  return (
    <Box
      role="alert"
      aria-live="assertive"
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
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexWrap: "wrap", justifyContent: "center" }}
        >
          {onRetry ? (
            <Button variant="contained" color="primary" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          {secondaryAction}
        </Stack>
      </Stack>
    </Box>
  );
}
