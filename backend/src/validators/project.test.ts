import { describe, expect, it } from "@jest/globals";
import {
  validateCreateProject,
  validateUpdateProject,
  validateProjectListQuery,
} from "./project";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid create payload — only the two required fields. */
const minimalCreate = { name: "My Project", ownerId: "user-1" };

/** Extracts the first error path+message pair for a failed result. */
function firstError(result: ReturnType<typeof validateCreateProject>) {
  if (result.success) return null;
  const issue = result.error.issues[0];
  return { path: issue?.path, message: issue?.message };
}

// ---------------------------------------------------------------------------
// createProjectSchema
// ---------------------------------------------------------------------------

describe("validateCreateProject", () => {
  // ---- Required fields ----------------------------------------------------

  describe("required fields", () => {
    it("fails when name is missing", () => {
      const result = validateCreateProject({ ownerId: "user-1" });
      expect(result.success).toBe(false);
    });

    it("fails when ownerId is missing", () => {
      const result = validateCreateProject({ name: "My Project" });
      expect(result.success).toBe(false);
    });

    it("fails when name is too short (< 3 chars)", () => {
      const result = validateCreateProject({ ...minimalCreate, name: "ab" });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/at least 3/i);
    });

    it("fails when name exceeds 100 characters", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/at most 100/i);
    });

    it("fails when ownerId is an empty string", () => {
      const result = validateCreateProject({ ...minimalCreate, ownerId: "" });
      expect(result.success).toBe(false);
    });

    it("fails when name is not a string", () => {
      const result = validateCreateProject({ ...minimalCreate, name: 42 });
      expect(result.success).toBe(false);
    });

    it("trims whitespace from name", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        name: "  Valid Name  ",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.name).toBe("Valid Name");
    });
  });

  // ---- Progress -----------------------------------------------------------

  describe("progress validation", () => {
    it("fails when progress is below 0", () => {
      const result = validateCreateProject({ ...minimalCreate, progress: -1 });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/at least 0/i);
    });

    it("fails when progress exceeds 100", () => {
      const result = validateCreateProject({ ...minimalCreate, progress: 101 });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/at most 100/i);
    });

    it("fails when progress is a float", () => {
      const result = validateCreateProject({ ...minimalCreate, progress: 50.5 });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/integer/i);
    });

    it("accepts progress at the lower boundary (0)", () => {
      const result = validateCreateProject({ ...minimalCreate, progress: 0 });
      expect(result.success).toBe(true);
    });

    it("accepts progress at the upper boundary (100)", () => {
      const result = validateCreateProject({ ...minimalCreate, progress: 100 });
      expect(result.success).toBe(true);
    });

    it("defaults progress to 0 when omitted", () => {
      const result = validateCreateProject(minimalCreate);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.progress).toBe(0);
    });
  });

  // ---- Date validation ----------------------------------------------------

  describe("date validation", () => {
    it("fails when endDate precedes startDate", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        startDate: "2024-06-01",
        endDate: "2024-05-01",
      });
      expect(result.success).toBe(false);
      const dateIssue = result.success
        ? null
        : result.error.issues.find((i) => i.path.includes("endDate"));
      expect(dateIssue?.message).toMatch(/on or after startDate/i);
    });

    it("passes when endDate equals startDate", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        startDate: "2024-06-01",
        endDate: "2024-06-01",
      });
      expect(result.success).toBe(true);
    });

    it("passes when endDate is after startDate", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });
      expect(result.success).toBe(true);
    });

    it("fails on an invalid date string", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        startDate: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("accepts ISO datetime strings", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        startDate: "2024-03-15T09:00:00.000Z",
        endDate: "2024-04-15T09:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });
  });

  // ---- Enum validation ----------------------------------------------------

  describe("enum validation", () => {
    it("fails on an invalid status value", () => {
      const result = validateCreateProject({ ...minimalCreate, status: "UNKNOWN" });
      expect(result.success).toBe(false);
    });

    it("accepts every valid status value", () => {
      const statuses = ["PLANNED", "IN_PROGRESS", "ON_HOLD", "AT_RISK", "COMPLETED"];
      for (const status of statuses) {
        const result = validateCreateProject({ ...minimalCreate, status });
        expect(result.success).toBe(true);
      }
    });

    it("defaults status to PLANNED when omitted", () => {
      const result = validateCreateProject(minimalCreate);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.status).toBe("PLANNED");
    });

    it("fails on an invalid priority value", () => {
      const result = validateCreateProject({ ...minimalCreate, priority: "URGENT" });
      expect(result.success).toBe(false);
    });

    it("accepts every valid priority value", () => {
      const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
      for (const priority of priorities) {
        const result = validateCreateProject({ ...minimalCreate, priority });
        expect(result.success).toBe(true);
      }
    });

    it("defaults priority to MEDIUM when omitted", () => {
      const result = validateCreateProject(minimalCreate);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.priority).toBe("MEDIUM");
    });
  });

  // ---- Valid payloads -----------------------------------------------------

  describe("valid payloads", () => {
    it("passes with only required fields", () => {
      const result = validateCreateProject(minimalCreate);
      expect(result.success).toBe(true);
    });

    it("passes with a fully-specified payload", () => {
      const result = validateCreateProject({
        name: "Full Project",
        description: "A complete payload",
        status: "IN_PROGRESS",
        priority: "HIGH",
        ownerId: "user-42",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        progress: 40,
        riskNotes: "Some risk notes",
      });
      expect(result.success).toBe(true);
    });

    it("coerces date strings to Date objects", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        startDate: "2024-01-01",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.startDate).toBeInstanceOf(Date);
    });

    it("description trims whitespace", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        description: "  trimmed  ",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.description).toBe("trimmed");
    });

    it("fails when description exceeds 2000 characters", () => {
      const result = validateCreateProject({
        ...minimalCreate,
        description: "x".repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// updateProjectSchema
// ---------------------------------------------------------------------------

describe("validateUpdateProject", () => {
  // ---- Required fields ----------------------------------------------------

  describe("required fields", () => {
    it("passes with an empty object (all fields optional)", () => {
      const result = validateUpdateProject({});
      expect(result.success).toBe(true);
    });

    it("fails when name is present but too short", () => {
      const result = validateUpdateProject({ name: "ab" });
      expect(result.success).toBe(false);
    });

    it("fails when ownerId is present but empty", () => {
      const result = validateUpdateProject({ ownerId: "" });
      expect(result.success).toBe(false);
    });
  });

  // ---- Progress -----------------------------------------------------------

  describe("progress validation", () => {
    it("fails when progress is below 0", () => {
      const result = validateUpdateProject({ progress: -1 });
      expect(result.success).toBe(false);
    });

    it("fails when progress exceeds 100", () => {
      const result = validateUpdateProject({ progress: 101 });
      expect(result.success).toBe(false);
    });

    it("fails when progress is a float", () => {
      const result = validateUpdateProject({ progress: 33.3 });
      expect(result.success).toBe(false);
    });

    it("accepts valid progress", () => {
      const result = validateUpdateProject({ progress: 75 });
      expect(result.success).toBe(true);
    });
  });

  // ---- Date validation ----------------------------------------------------

  describe("date validation", () => {
    it("fails when endDate precedes startDate", () => {
      const result = validateUpdateProject({
        startDate: "2024-06-01",
        endDate: "2024-05-01",
      });
      expect(result.success).toBe(false);
    });

    it("passes when only startDate is provided", () => {
      const result = validateUpdateProject({ startDate: "2024-06-01" });
      expect(result.success).toBe(true);
    });

    it("passes when only endDate is provided", () => {
      const result = validateUpdateProject({ endDate: "2024-06-01" });
      expect(result.success).toBe(true);
    });

    it("accepts null to clear startDate", () => {
      const result = validateUpdateProject({ startDate: null });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.startDate).toBeNull();
    });

    it("accepts null to clear endDate", () => {
      const result = validateUpdateProject({ endDate: null });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.endDate).toBeNull();
    });
  });

  // ---- Enum validation ----------------------------------------------------

  describe("enum validation", () => {
    it("fails on an invalid status value", () => {
      const result = validateUpdateProject({ status: "DELETED" });
      expect(result.success).toBe(false);
    });

    it("fails on an invalid priority value", () => {
      const result = validateUpdateProject({ priority: "EXTREME" });
      expect(result.success).toBe(false);
    });

    it("accepts a valid status update", () => {
      const result = validateUpdateProject({ status: "COMPLETED" });
      expect(result.success).toBe(true);
    });

    it("accepts a valid priority update", () => {
      const result = validateUpdateProject({ priority: "CRITICAL" });
      expect(result.success).toBe(true);
    });
  });

  // ---- Valid payloads -----------------------------------------------------

  describe("valid payloads", () => {
    it("passes with a partial update", () => {
      const result = validateUpdateProject({ name: "Updated Name", progress: 80 });
      expect(result.success).toBe(true);
    });

    it("passes when nullable fields are explicitly set to null", () => {
      const result = validateUpdateProject({
        description: null,
        startDate: null,
        endDate: null,
        riskNotes: null,
      });
      expect(result.success).toBe(true);
    });

    it("passes with a fully-specified update payload", () => {
      const result = validateUpdateProject({
        name: "Renamed Project",
        description: "Updated description",
        status: "AT_RISK",
        priority: "CRITICAL",
        ownerId: "user-99",
        startDate: "2024-02-01",
        endDate: "2024-11-30",
        progress: 60,
        riskNotes: "Updated risk notes",
      });
      expect(result.success).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// projectListQuerySchema
// ---------------------------------------------------------------------------

describe("validateProjectListQuery", () => {
  // ---- Defaults -----------------------------------------------------------

  describe("defaults", () => {
    it("applies sortBy=createdAt when omitted", () => {
      const result = validateProjectListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.sortBy).toBe("createdAt");
    });

    it("applies sortOrder=desc when omitted", () => {
      const result = validateProjectListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.sortOrder).toBe("desc");
    });

    it("applies page=1 when omitted", () => {
      const result = validateProjectListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.page).toBe(1);
    });

    it("applies pageSize=20 when omitted", () => {
      const result = validateProjectListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.pageSize).toBe(20);
    });

    it("applies includeArchived=false when omitted", () => {
      const result = validateProjectListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe(false);
    });
  });

  // ---- Coercion -----------------------------------------------------------

  describe("string coercion (query params arrive as strings)", () => {
    it("coerces page from string to number", () => {
      const result = validateProjectListQuery({ page: "3" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.page).toBe(3);
    });

    it("coerces pageSize from string to number", () => {
      const result = validateProjectListQuery({ pageSize: "50" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.pageSize).toBe(50);
    });

    it('coerces includeArchived "true" string to boolean true', () => {
      const result = validateProjectListQuery({ includeArchived: "true" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe(true);
    });

    it('coerces includeArchived "false" string to boolean false', () => {
      const result = validateProjectListQuery({ includeArchived: "false" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe(false);
    });

    it("accepts boolean true for includeArchived", () => {
      const result = validateProjectListQuery({ includeArchived: true });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe(true);
    });
  });

  // ---- Invalid values -----------------------------------------------------

  describe("invalid values", () => {
    it("fails on an invalid status filter", () => {
      const result = validateProjectListQuery({ status: "INVALID" });
      expect(result.success).toBe(false);
    });

    it("fails on an invalid priority filter", () => {
      const result = validateProjectListQuery({ priority: "EXTREME" });
      expect(result.success).toBe(false);
    });

    it("fails on an invalid sortBy value", () => {
      const result = validateProjectListQuery({ sortBy: "title" });
      expect(result.success).toBe(false);
    });

    it("fails on an invalid sortOrder value", () => {
      const result = validateProjectListQuery({ sortOrder: "ascending" });
      expect(result.success).toBe(false);
    });

    it("fails when page is 0", () => {
      const result = validateProjectListQuery({ page: "0" });
      expect(result.success).toBe(false);
    });

    it("fails when pageSize is 0", () => {
      const result = validateProjectListQuery({ pageSize: "0" });
      expect(result.success).toBe(false);
    });

    it("fails when pageSize exceeds 100", () => {
      const result = validateProjectListQuery({ pageSize: "101" });
      expect(result.success).toBe(false);
    });
  });

  // ---- Valid payloads -----------------------------------------------------

  describe("valid payloads", () => {
    it("passes with an empty query object", () => {
      const result = validateProjectListQuery({});
      expect(result.success).toBe(true);
    });

    it("passes with all valid filter params", () => {
      const result = validateProjectListQuery({
        q: "tracker",
        status: "IN_PROGRESS",
        priority: "HIGH",
        owner: "alice",
        sortBy: "priority",
        sortOrder: "asc",
        page: "2",
        pageSize: "10",
        includeArchived: "true",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.q).toBe("tracker");
        expect(result.data.status).toBe("IN_PROGRESS");
        expect(result.data.priority).toBe("HIGH");
        expect(result.data.sortBy).toBe("priority");
        expect(result.data.sortOrder).toBe("asc");
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(10);
        expect(result.data.includeArchived).toBe(true);
      }
    });

    it("accepts pageSize at the upper boundary (100)", () => {
      const result = validateProjectListQuery({ pageSize: "100" });
      expect(result.success).toBe(true);
    });

    it("accepts all valid sortBy values", () => {
      const fields = ["name", "createdAt", "updatedAt", "priority", "progress"];
      for (const sortBy of fields) {
        const result = validateProjectListQuery({ sortBy });
        expect(result.success).toBe(true);
      }
    });
  });
});
