"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
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
  priorityLabels,
  projectStatusLabels,
  type ProjectStatus,
} from "@/constants/enums";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/features/projects/projectFormSchema";
import { getSelectableProjectStatuses } from "@/features/projects/projectFormUtils";
import type { ProjectOwner } from "@/types/project";

export type ProjectFormProps = {
  mode: "create" | "edit";
  defaultValues: ProjectFormValues;
  ownerOptions: ProjectOwner[];
  /** Current persisted status — used to limit allowed transitions when editing. */
  currentStatus?: ProjectStatus;
  isSubmitting?: boolean;
  ownersLoading?: boolean;
  submitLabel?: string;
  onSubmit: (values: ProjectFormValues) => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Shared create/edit project form (React Hook Form + Zod + MUI).
 */
export function ProjectForm({
  mode,
  defaultValues,
  ownerOptions,
  currentStatus,
  isSubmitting = false,
  ownersLoading = false,
  submitLabel,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const statusOptions = getSelectableProjectStatuses(
    mode === "edit" ? currentStatus : undefined,
  );

  const resolvedSubmitLabel =
    submitLabel ?? (mode === "create" ? "Create project" : "Save changes");

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      aria-busy={isSubmitting}
    >
      <Stack spacing={2.5}>
        <TextField
          label="Name"
          required
          fullWidth
          autoComplete="off"
          disabled={isSubmitting}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          {...register("name")}
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

        <Controller
          name="ownerId"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              required
              error={Boolean(errors.ownerId)}
              disabled={isSubmitting || ownersLoading}
            >
              <InputLabel id="project-owner-label" shrink>Owner</InputLabel>
              <Select
                {...field}
                labelId="project-owner-label"
                label="Owner"
                displayEmpty
                notched
              >
                <MenuItem value="">
                  <em>
                    {ownersLoading
                      ? "Loading owners…"
                      : ownerOptions.length === 0
                        ? "No owners available"
                        : "Select an owner"}
                  </em>
                </MenuItem>
                {ownerOptions.map((owner) => (
                  <MenuItem key={owner.id} value={owner.id}>
                    {owner.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.ownerId?.message ??
                  (ownerOptions.length === 0 && !ownersLoading
                    ? "Owners appear after projects exist in the portfolio. Seed the database if this list is empty."
                    : " ")}
              </FormHelperText>
            </FormControl>
          )}
        />

        {ownerOptions.length === 0 && !ownersLoading ? (
          <Alert severity="warning">
            No owners could be loaded from existing projects. Ensure the API is
            running and the database is seeded.
          </Alert>
        ) : null}

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
                <InputLabel id="project-status-label" shrink>Status</InputLabel>
                <Select {...field} labelId="project-status-label" label="Status" displayEmpty notched>
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {projectStatusLabels[status]}
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
                <InputLabel id="project-priority-label" shrink>Priority</InputLabel>
                <Select
                  {...field}
                  labelId="project-priority-label"
                  label="Priority"
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
          name="progress"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Progress"
              type="number"
              required
              fullWidth
              disabled={isSubmitting}
              error={Boolean(errors.progress)}
              helperText={
                errors.progress?.message ??
                "Integer from 0 to 100. Must be 100 when status is Completed."
              }
              slotProps={{
                htmlInput: { min: 0, max: 100, step: 1 },
              }}
              onChange={(event) => {
                const next = event.target.value;
                field.onChange(next === "" ? NaN : Number(next));
              }}
              value={Number.isNaN(field.value) ? "" : field.value}
            />
          )}
        />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <TextField
            label="Start date"
            type="date"
            fullWidth
            disabled={isSubmitting}
            error={Boolean(errors.startDate)}
            helperText={errors.startDate?.message}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            {...register("startDate")}
          />

          <TextField
            label="End date"
            type="date"
            fullWidth
            disabled={isSubmitting}
            error={Boolean(errors.endDate)}
            helperText={
              errors.endDate?.message ??
              "Must be on or after the start date when both are set."
            }
            slotProps={{
              inputLabel: { shrink: true },
            }}
            {...register("endDate")}
          />
        </Box>

        <TextField
          label="Risk notes"
          fullWidth
          multiline
          minRows={3}
          disabled={isSubmitting}
          error={Boolean(errors.riskNotes)}
          helperText={errors.riskNotes?.message}
          {...register("riskNotes")}
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
