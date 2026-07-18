import {
  PRIORITY_VALUES,
  TASK_STATUS_VALUES,
} from "@/constants/enums";
import { z } from "@/lib/validation";

/**
 * Client task form schema aligned with backend create/update validators
 * (backend/src/validators/task.ts).
 */
export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters"),
  status: z.enum(TASK_STATUS_VALUES, {
    error: "Status is required",
  }),
  priority: z.enum(PRIORITY_VALUES, {
    error: "Priority is required",
  }),
  /** Empty string means unassigned. */
  assigneeId: z.string(),
  /** `yyyy-MM-dd` from date inputs, or empty string when unset. */
  dueDate: z.string(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

/** Safe-parse helper for tests and optional pre-submit checks. */
export const validateTaskForm = (data: unknown) =>
  taskFormSchema.safeParse(data);

export const TASK_FORM_DEFAULT_VALUES: TaskFormValues = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  assigneeId: "",
  dueDate: "",
};
