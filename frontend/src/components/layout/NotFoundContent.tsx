"use client";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Button from "@mui/material/Button";
import Link from "next/link";

import { ErrorState } from "@/components/ui";
import { appRoutes } from "@/constants/routes";

/**
 * Shared 404 body used by root and `(app)` not-found routes.
 */
export function NotFoundContent() {
  return (
    <ErrorState
      title="Page not found"
      message="The page you requested does not exist or may have been moved. Use the navigation or return to the dashboard."
      secondaryAction={
        <Button
          component={Link}
          href={appRoutes.dashboard}
          variant="contained"
          color="primary"
          startIcon={<HomeOutlinedIcon />}
        >
          Back to Dashboard
        </Button>
      }
    />
  );
}
