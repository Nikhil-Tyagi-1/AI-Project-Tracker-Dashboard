/**
 * Shared layout for status/priority chips so labels of different lengths
 * render at a consistent size (fits longest label: "In Progress").
 */
export const semanticChipSx = {
  width: 108,
  justifyContent: "center",
  fontWeight: 600,
  "& .MuiChip-label": {
    width: "100%",
    textAlign: "center",
    px: 0.75,
  },
} as const;
