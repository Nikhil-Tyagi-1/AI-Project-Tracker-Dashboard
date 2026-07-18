"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { TaskForm } from "@/features/tasks/components/TaskForm";
import type { TaskFormValues } from "@/features/tasks/taskFormSchema";
import type { TaskAssigneeOption } from "@/features/tasks/taskFormUtils";

export type TaskFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  /** Stable remount key (e.g. task id) when defaults change. */
  editingKey?: string;
  defaultValues: TaskFormValues;
  assigneeOptions: TaskAssigneeOption[];
  isSubmitting?: boolean;
  assigneesLoading?: boolean;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
  onClose: () => void;
};

/**
 * Modal wrapper around TaskForm for Kanban create/edit flows.
 */
export function TaskFormDialog({
  open,
  mode,
  title,
  editingKey = "new",
  defaultValues,
  assigneeOptions,
  isSubmitting = false,
  assigneesLoading = false,
  onSubmit,
  onClose,
}: TaskFormDialogProps) {
  const titleId = `task-form-dialog-${mode}-title`;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      aria-labelledby={titleId}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id={titleId} sx={{ fontWeight: 650 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {/* Remount form when switching create/edit or target task defaults. */}
        <TaskForm
          key={`${mode}-${editingKey}`}
          mode={mode}
          defaultValues={defaultValues}
          assigneeOptions={assigneeOptions}
          isSubmitting={isSubmitting}
          assigneesLoading={assigneesLoading}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
