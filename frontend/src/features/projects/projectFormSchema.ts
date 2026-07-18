import {
  PRIORITY_VALUES,
  PROJECT_STATUS_VALUES,
} from "@/constants/enums";
import { z } from "@/lib/validation";

/**
 * Client project form schema aligned with backend create/update validators
 * (backend/src/validators/project.ts) plus completion progress rule.
 */
export const projectFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be at most 100 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be at most 2000 characters"),
    ownerId: z.string().min(1, "Owner is required"),
    status: z.enum(PROJECT_STATUS_VALUES, {
      error: "Status is required",
    }),
    priority: z.enum(PRIORITY_VALUES, {
      error: "Priority is required",
    }),
    progress: z
      .number({ error: "Progress must be a number" })
      .int("Progress must be an integer")
      .min(0, "Progress must be at least 0")
      .max(100, "Progress must be at most 100"),
    /** `yyyy-MM-dd` from date inputs, or empty string when unset. */
    startDate: z.string(),
    endDate: z.string(),
    riskNotes: z
      .string()
      .trim()
      .max(2000, "Risk notes must be at most 2000 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end < start
      ) {
        ctx.addIssue({
          code: "custom",
          message: "endDate must be on or after startDate",
          path: ["endDate"],
        });
      }
    }

    if (data.status === "COMPLETED" && data.progress !== 100) {
      ctx.addIssue({
        code: "custom",
        message: "Progress must be 100 when status is COMPLETED",
        path: ["progress"],
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const PROJECT_FORM_DEFAULT_VALUES: ProjectFormValues = {
  name: "",
  description: "",
  ownerId: "",
  status: "PLANNED",
  priority: "MEDIUM",
  progress: 0,
  startDate: "",
  endDate: "",
  riskNotes: "",
};
