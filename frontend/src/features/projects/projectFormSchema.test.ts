import { describe, expect, it } from "vitest";

import {
  PROJECT_FORM_DEFAULT_VALUES,
  validateProjectForm,
} from "@/features/projects/projectFormSchema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid form payload — required fields populated. */
const validForm = {
  ...PROJECT_FORM_DEFAULT_VALUES,
  name: "Portal Redesign",
  ownerId: "user-1",
  progress: 25,
};

/** Extracts the first issue path+message for a failed parse. */
function firstError(result: ReturnType<typeof validateProjectForm>) {
  if (result.success) return null;
  const issue = result.error.issues[0];
  return {
    path: issue?.path.map(String).join(".") ?? "",
    message: issue?.message ?? "",
  };
}

function errorOn(
  result: ReturnType<typeof validateProjectForm>,
  path: string,
) {
  if (result.success) return undefined;
  return result.error.issues.find(
    (issue) => issue.path.map(String).join(".") === path,
  );
}

// ---------------------------------------------------------------------------
// Required fields
// ---------------------------------------------------------------------------

describe("validateProjectForm — required fields", () => {
  it("fails when name is empty", () => {
    const result = validateProjectForm({ ...validForm, name: "" });
    expect(result.success).toBe(false);
    expect(firstError(result)?.message).toMatch(/at least 3/i);
  });

  it("fails when name is too short (< 3 chars)", () => {
    const result = validateProjectForm({ ...validForm, name: "ab" });
    expect(result.success).toBe(false);
    expect(firstError(result)?.message).toMatch(/at least 3/i);
  });

  it("fails when name exceeds 100 characters", () => {
    const result = validateProjectForm({
      ...validForm,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
    expect(firstError(result)?.message).toMatch(/at most 100/i);
  });

  it("fails when ownerId is empty", () => {
    const result = validateProjectForm({ ...validForm, ownerId: "" });
    expect(result.success).toBe(false);
    expect(errorOn(result, "ownerId")?.message).toMatch(/owner is required/i);
  });

  it("trims whitespace from name", () => {
    const result = validateProjectForm({
      ...validForm,
      name: "  Valid Name  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Valid Name");
  });

  it("passes with required fields and defaults", () => {
    const result = validateProjectForm(validForm);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

describe("validateProjectForm — progress validation", () => {
  it("fails when progress is below 0", () => {
    const result = validateProjectForm({ ...validForm, progress: -1 });
    expect(result.success).toBe(false);
    expect(errorOn(result, "progress")?.message).toMatch(/at least 0/i);
  });

  it("fails when progress exceeds 100", () => {
    const result = validateProjectForm({ ...validForm, progress: 101 });
    expect(result.success).toBe(false);
    expect(errorOn(result, "progress")?.message).toMatch(/at most 100/i);
  });

  it("fails when progress is a float", () => {
    const result = validateProjectForm({ ...validForm, progress: 50.5 });
    expect(result.success).toBe(false);
    expect(errorOn(result, "progress")?.message).toMatch(/integer/i);
  });

  it("fails when progress is not a number (NaN)", () => {
    const result = validateProjectForm({ ...validForm, progress: Number.NaN });
    expect(result.success).toBe(false);
  });

  it("accepts progress at the lower boundary (0)", () => {
    const result = validateProjectForm({ ...validForm, progress: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts progress at the upper boundary (100)", () => {
    const result = validateProjectForm({ ...validForm, progress: 100 });
    expect(result.success).toBe(true);
  });

  it("fails when status is COMPLETED but progress is not 100", () => {
    const result = validateProjectForm({
      ...validForm,
      status: "COMPLETED",
      progress: 90,
    });
    expect(result.success).toBe(false);
    expect(errorOn(result, "progress")?.message).toMatch(/100 when status is COMPLETED/i);
  });

  it("passes when status is COMPLETED and progress is 100", () => {
    const result = validateProjectForm({
      ...validForm,
      status: "COMPLETED",
      progress: 100,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

describe("validateProjectForm — date validation", () => {
  it("fails when endDate precedes startDate", () => {
    const result = validateProjectForm({
      ...validForm,
      startDate: "2024-06-01",
      endDate: "2024-05-01",
    });
    expect(result.success).toBe(false);
    expect(errorOn(result, "endDate")?.message).toMatch(
      /on or after startDate/i,
    );
  });

  it("passes when endDate equals startDate", () => {
    const result = validateProjectForm({
      ...validForm,
      startDate: "2024-06-01",
      endDate: "2024-06-01",
    });
    expect(result.success).toBe(true);
  });

  it("passes when endDate is after startDate", () => {
    const result = validateProjectForm({
      ...validForm,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("passes when only startDate is set", () => {
    const result = validateProjectForm({
      ...validForm,
      startDate: "2024-06-01",
      endDate: "",
    });
    expect(result.success).toBe(true);
  });

  it("passes when only endDate is set", () => {
    const result = validateProjectForm({
      ...validForm,
      startDate: "",
      endDate: "2024-06-01",
    });
    expect(result.success).toBe(true);
  });

  it("passes when both dates are empty", () => {
    const result = validateProjectForm({
      ...validForm,
      startDate: "",
      endDate: "",
    });
    expect(result.success).toBe(true);
  });
});
