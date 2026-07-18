"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Controller, useForm } from "react-hook-form";

import {
  PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  priorityLabels,
  taskStatusLabels,
} from "@/constants/enums";
import {
  taskFormSchema,
  type TaskFormValues,
} from "@/features/tasks/taskFormSchema";
import type { TaskAssigneeOption } from "@/features/tasks/taskFormUtils";

export type TaskFormProps = {
  mode: "create" | "edit";
  defaultValues: TaskFormValues;
  assigneeOptions: TaskAssigneeOption[];
  isSubmitting?: boolean;
  assigneesLoading?: boolean;
  submitLabel?: string;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Shared create/edit task form (React Hook Form + Zod + MUI).
 */
export function TaskForm({
  mode,
  defaultValues,
  assigneeOptions,
  isSubmitting = false,
  assigneesLoading = false,
  submitLabel,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
    // Validate only on submit — avoid errors on open or while typing.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const resolvedSubmitLabel =
    submitLabel ?? (mode === "create" ? "Create task" : "Save changes");

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-busy={isSubmitting}
    >
      <Stack spacing={2.5}>
        <TextField
          label="Title"
          required
          fullWidth
          autoComplete="off"
          autoFocus={mode === "create"}
          disabled={isSubmitting}
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          {...register("title")}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          minRows={3}
          disabled={isSubmitting}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
          {...register("description")}
        />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                required
                error={Boolean(errors.status)}
                disabled={isSubmitting}
              >
                <InputLabel id="task-status-label" shrink>Status</InputLabel>
                <Select
                  {...field}
                  labelId="task-status-label"
                  label="Status"
                  displayEmpty
                  notched
                >
                  {TASK_STATUS_VALUES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {taskStatusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.status?.message ?? " "}</FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                required
                error={Boolean(errors.priority)}
                disabled={isSubmitting}
              >
                <InputLabel id="task-priority-label" shrink>Priority</InputLabel>
                <Select
                  {...field}
                  labelId="task-priority-label"
                  label="Priority"
                  displayEmpty
                  notched
                >
                  {PRIORITY_VALUES.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.priority?.message ?? " "}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Box>

        <Controller
          name="assigneeId"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              error={Boolean(errors.assigneeId)}
              disabled={isSubmitting || assigneesLoading}
            >
              <InputLabel id="task-assignee-label" shrink>
                Assignee
              </InputLabel>
              <Select
                {...field}
                labelId="task-assignee-label"
                label="Assignee"
                displayEmpty
                notched
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {assigneeOptions.map((assignee) => (
                  <MenuItem key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.assigneeId?.message ??
                  (assigneesLoading
                    ? "Loading assignees…"
                    : assigneeOptions.length === 0
                      ? "No assignees available yet — leave unassigned or create projects with owners first."
                      : " ")}
              </FormHelperText>
            </FormControl>
          )}
        />

        <TextField
          label="Due date"
          type="date"
          fullWidth
          disabled={isSubmitting}
          error={Boolean(errors.dueDate)}
          helperText={errors.dueDate?.message}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          {...register("dueDate")}
        />

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "flex-end", pt: 1 }}
        >
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || (mode === "edit" && !isDirty)}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" aria-hidden />
              ) : undefined
            }
          >
            {isSubmitting ? "Saving…" : resolvedSubmitLabel}
          </Button>
        </Stack>

        {mode === "edit" && !isDirty ? (
          <Typography variant="caption" color="text.secondary">
            Make a change to enable saving.
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
