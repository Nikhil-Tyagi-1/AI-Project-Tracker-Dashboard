"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { ReactNode } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  /** Dialog title announced to assistive tech. */
  title: string;
  /** Body copy describing the consequence of confirming. */
  description: ReactNode;
  /** Confirm button label. */
  confirmLabel?: string;
  /** Cancel button label. */
  cancelLabel?: string;
  /** When true, confirm uses the error (destructive) color. */
  destructive?: boolean;
  /** Disables actions while an async confirm is in flight. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional id prefix for aria wiring; defaults are generated from title. */
  id?: string;
};

/**
 * Accessible confirmation dialog for destructive or irreversible actions.
 * MUI Dialog provides focus trap and Escape-to-close behavior.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
  id = "confirm-dialog",
}: ConfirmDialogProps) {
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id={titleId} sx={{ fontWeight: 650 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        {typeof description === "string" ? (
          <DialogContentText id={descriptionId}>{description}</DialogContentText>
        ) : (
          <DialogContentText id={descriptionId} component="div">
            {description}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onCancel} disabled={loading} color="inherit">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={destructive ? "error" : "primary"}
          autoFocus
        >
          {loading ? "Please wait…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
