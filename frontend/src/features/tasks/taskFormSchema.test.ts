import { describe, expect, it } from "vitest";

import {
  TASK_FORM_DEFAULT_VALUES,
  validateTaskForm,
} from "@/features/tasks/taskFormSchema";

const validForm = {
  ...TASK_FORM_DEFAULT_VALUES,
  title: "Design Kanban card",
};

function firstError(result: ReturnType<typeof validateTaskForm>) {
  if (result.success) return null;
  const issue = result.error.issues[0];
  return {
    path: issue?.path.map(String).join(".") ?? "",
    message: issue?.message ?? "",
  };
}

describe("validateTaskForm — required fields", () => {
  it("fails when title is empty", () => {
    const result = validateTaskForm({ ...validForm, title: "" });
    expect(result.success).toBe(false);
    expect(firstError(result)?.message).toMatch(/at least 3/i);
  });

  it("fails when title is too short", () => {
    const result = validateTaskForm({ ...validForm, title: "ab" });
    expect(result.success).toBe(false);
    expect(firstError(result)?.message).toMatch(/at least 3/i);
  });

  it("fails when title exceeds 100 characters", () => {
    const result = validateTaskForm({
      ...validForm,
      title: "a".repeat(101),
    });
    expect(result.success).toBe(false);
    expect(firstError(result)?.message).toMatch(/at most 100/i);
  });

  it("trims whitespace from title", () => {
    const result = validateTaskForm({
      ...validForm,
      title: "  Valid Title  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Valid Title");
  });

  it("accepts a valid payload", () => {
    const result = validateTaskForm({
      ...validForm,
      description: "Details",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: "user-1",
      dueDate: "2026-08-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = validateTaskForm({
      ...validForm,
      status: "BLOCKED",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 2000 characters", () => {
    const result = validateTaskForm({
      ...validForm,
      description: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
    expect(firstError(result)?.message).toMatch(/at most 2000/i);
  });

  it("rejects an invalid priority", () => {
    const result = validateTaskForm({
      ...validForm,
      priority: "URGENT",
    });
    expect(result.success).toBe(false);
  });
});
