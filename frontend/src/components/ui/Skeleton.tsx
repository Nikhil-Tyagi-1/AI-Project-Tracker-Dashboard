"use client";

import MuiSkeleton, {
  type SkeletonProps as MuiSkeletonProps,
} from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export type SkeletonProps = MuiSkeletonProps;

/**
 * Theme-aware skeleton primitive.
 * Prefer this over importing MUI Skeleton directly so loading UI stays consistent.
 */
export function Skeleton(props: SkeletonProps) {
  return (
    <MuiSkeleton
      animation="wave"
      {...props}
      sx={[
        { bgcolor: "action.hover" },
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
    />
  );
}

export type ContentSkeletonProps = {
  /** Number of text lines to render below an optional media block. */
  lines?: number;
  /** Show a rectangular media placeholder above the text lines. */
  showMedia?: boolean;
  /** Height of the media placeholder when `showMedia` is true. */
  mediaHeight?: number | string;
  /** Accessible label announced while content is loading. */
  "aria-label"?: string;
};

/**
 * Composed loading placeholder for list/detail sections.
 */
export function ContentSkeleton({
  lines = 3,
  showMedia = false,
  mediaHeight = 160,
  "aria-label": ariaLabel = "Loading content",
}: ContentSkeletonProps) {
  return (
    <Box
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <Stack spacing={1.5} aria-hidden>
        {showMedia ? (
          <Skeleton variant="rounded" width="100%" height={mediaHeight} />
        ) : null}
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 && lines > 1 ? "60%" : "100%"}
            height={28}
          />
        ))}
      </Stack>
    </Box>
  );
}
