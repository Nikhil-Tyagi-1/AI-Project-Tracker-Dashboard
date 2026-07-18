"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type PagePlaceholderProps = {
  title: string;
  description: string;
};

/**
 * Shell-level placeholder for routes whose feature UI is not implemented yet.
 * Not for empty data states — use EmptyState for those.
 */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <Box component="section" aria-labelledby="page-placeholder-title">
      <Stack spacing={1.5} sx={{ maxWidth: 640 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <Typography
            id="page-placeholder-title"
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            {title}
          </Typography>
          <Chip
            label="Coming soon"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Box>
  );
}
