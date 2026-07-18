import { describe, expect, it } from "@jest/globals";
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskListQuery,
} from "./task";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid create payload — only the two required fields. */
const minimalCreate = { title: "My Task", projectId: "project-1" };

/** Extracts the first error path+message pair for a failed result. */
function firstError(result: ReturnType<typeof validateCreateTask>) {
  if (result.success) return null;
  const issue = result.error.issues[0];
  return { path: issue?.path, message: issue?.message };
}

// ---------------------------------------------------------------------------
// createTaskSchema
// ---------------------------------------------------------------------------

describe("validateCreateTask", () => {
  // ---- Required title -----------------------------------------------------

  describe("required title", () => {
    it("fails when title is missing", () => {
      const result = validateCreateTask({ projectId: "project-1" });
      expect(result.success).toBe(false);
    });

    it("fails when title is too short (< 3 chars)", () => {
      const result = validateCreateTask({ ...minimalCreate, title: "ab" });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/at least 3/i);
    });

    it("fails when title exceeds 100 characters", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        title: "a".repeat(101),
      });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/at most 100/i);
    });

    it("fails when title is not a string", () => {
      const result = validateCreateTask({ ...minimalCreate, title: 42 });
      expect(result.success).toBe(false);
    });

    it("trims whitespace from title", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        title: "  Valid Title  ",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.title).toBe("Valid Title");
    });
  });

  // ---- projectId ----------------------------------------------------------

  describe("projectId", () => {
    it("fails when projectId is missing", () => {
      const result = validateCreateTask({ title: "My Task" });
      expect(result.success).toBe(false);
    });

    it("fails when projectId is an empty string", () => {
      const result = validateCreateTask({ ...minimalCreate, projectId: "" });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/projectId is required/i);
    });

    it("fails when projectId is not a string", () => {
      const result = validateCreateTask({ ...minimalCreate, projectId: 123 });
      expect(result.success).toBe(false);
    });

    it("fails when projectId is null", () => {
      const result = validateCreateTask({ ...minimalCreate, projectId: null });
      expect(result.success).toBe(false);
    });
  });

  // ---- Enum validation ----------------------------------------------------

  describe("enum validation", () => {
    it("fails on an invalid status value", () => {
      const result = validateCreateTask({ ...minimalCreate, status: "UNKNOWN" });
      expect(result.success).toBe(false);
    });

    it("accepts every valid status value", () => {
      const statuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
      for (const status of statuses) {
        const result = validateCreateTask({ ...minimalCreate, status });
        expect(result.success).toBe(true);
      }
    });

    it("defaults status to TODO when omitted", () => {
      const result = validateCreateTask(minimalCreate);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.status).toBe("TODO");
    });

    it("fails on an invalid priority value", () => {
      const result = validateCreateTask({ ...minimalCreate, priority: "URGENT" });
      expect(result.success).toBe(false);
    });

    it("accepts every valid priority value", () => {
      const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
      for (const priority of priorities) {
        const result = validateCreateTask({ ...minimalCreate, priority });
        expect(result.success).toBe(true);
      }
    });

    it("defaults priority to MEDIUM when omitted", () => {
      const result = validateCreateTask(minimalCreate);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.priority).toBe("MEDIUM");
    });
  });

  // ---- dueDate ------------------------------------------------------------

  describe("dueDate validation", () => {
    it("fails on an invalid date string", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        dueDate: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("fails when dueDate is an empty string", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        dueDate: "",
      });
      expect(result.success).toBe(false);
    });

    it("accepts ISO date strings", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        dueDate: "2024-06-15",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.dueDate).toBeInstanceOf(Date);
    });

    it("accepts ISO datetime strings", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        dueDate: "2024-06-15T09:00:00.000Z",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.dueDate).toBeInstanceOf(Date);
    });
  });

  // ---- sortOrder ----------------------------------------------------------

  describe("sortOrder validation", () => {
    it("fails when sortOrder is below 0", () => {
      const result = validateCreateTask({ ...minimalCreate, sortOrder: -1 });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/at least 0/i);
    });

    it("fails when sortOrder is a float", () => {
      const result = validateCreateTask({ ...minimalCreate, sortOrder: 1.5 });
      expect(result.success).toBe(false);
      expect(firstError(result)?.message).toMatch(/integer/i);
    });

    it("defaults sortOrder to 0 when omitted", () => {
      const result = validateCreateTask(minimalCreate);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.sortOrder).toBe(0);
    });

    it("accepts sortOrder at the lower boundary (0)", () => {
      const result = validateCreateTask({ ...minimalCreate, sortOrder: 0 });
      expect(result.success).toBe(true);
    });
  });

  // ---- Valid payloads -----------------------------------------------------

  describe("valid payloads", () => {
    it("passes with only required fields", () => {
      const result = validateCreateTask(minimalCreate);
      expect(result.success).toBe(true);
    });

    it("passes with a fully-specified payload", () => {
      const result = validateCreateTask({
        title: "Full Task",
        description: "A complete payload",
        projectId: "project-42",
        assigneeId: "user-7",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: "2024-12-31",
        sortOrder: 3,
      });
      expect(result.success).toBe(true);
    });

    it("description trims whitespace", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        description: "  trimmed  ",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.description).toBe("trimmed");
    });

    it("fails when description exceeds 2000 characters", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        description: "x".repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it("fails when assigneeId is an empty string", () => {
      const result = validateCreateTask({
        ...minimalCreate,
        assigneeId: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// updateTaskSchema
// ---------------------------------------------------------------------------

describe("validateUpdateTask", () => {
  // ---- Required fields ----------------------------------------------------

  describe("required fields", () => {
    it("passes with an empty object (all fields optional)", () => {
      const result = validateUpdateTask({});
      expect(result.success).toBe(true);
    });

    it("fails when title is present but too short", () => {
      const result = validateUpdateTask({ title: "ab" });
      expect(result.success).toBe(false);
    });

    it("fails when title exceeds 100 characters", () => {
      const result = validateUpdateTask({ title: "a".repeat(101) });
      expect(result.success).toBe(false);
    });

    it("does not accept projectId (tasks cannot be reassigned)", () => {
      const result = validateUpdateTask({ projectId: "other-project" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("projectId");
      }
    });
  });

  // ---- Enum validation ----------------------------------------------------

  describe("enum validation", () => {
    it("fails on an invalid status value", () => {
      const result = validateUpdateTask({ status: "DELETED" });
      expect(result.success).toBe(false);
    });

    it("fails on an invalid priority value", () => {
      const result = validateUpdateTask({ priority: "EXTREME" });
      expect(result.success).toBe(false);
    });

    it("accepts a valid status update", () => {
      const result = validateUpdateTask({ status: "DONE" });
      expect(result.success).toBe(true);
    });

    it("accepts a valid priority update", () => {
      const result = validateUpdateTask({ priority: "CRITICAL" });
      expect(result.success).toBe(true);
    });
  });

  // ---- dueDate ------------------------------------------------------------

  describe("dueDate validation", () => {
    it("fails on an invalid date string", () => {
      const result = validateUpdateTask({ dueDate: "not-a-date" });
      expect(result.success).toBe(false);
    });

    it("accepts null to clear dueDate", () => {
      const result = validateUpdateTask({ dueDate: null });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.dueDate).toBeNull();
    });

    it("accepts a valid ISO date", () => {
      const result = validateUpdateTask({ dueDate: "2024-06-01" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.dueDate).toBeInstanceOf(Date);
    });
  });

  // ---- sortOrder ----------------------------------------------------------

  describe("sortOrder validation", () => {
    it("fails when sortOrder is below 0", () => {
      const result = validateUpdateTask({ sortOrder: -1 });
      expect(result.success).toBe(false);
    });

    it("fails when sortOrder is a float", () => {
      const result = validateUpdateTask({ sortOrder: 2.5 });
      expect(result.success).toBe(false);
    });

    it("accepts a valid sortOrder", () => {
      const result = validateUpdateTask({ sortOrder: 5 });
      expect(result.success).toBe(true);
    });
  });

  // ---- Valid payloads -----------------------------------------------------

  describe("valid payloads", () => {
    it("passes with a partial update", () => {
      const result = validateUpdateTask({ title: "Updated Title", status: "IN_REVIEW" });
      expect(result.success).toBe(true);
    });

    it("passes when nullable fields are explicitly set to null", () => {
      const result = validateUpdateTask({
        description: null,
        assigneeId: null,
        dueDate: null,
      });
      expect(result.success).toBe(true);
    });

    it("passes with a fully-specified update payload", () => {
      const result = validateUpdateTask({
        title: "Renamed Task",
        description: "Updated description",
        assigneeId: "user-99",
        status: "IN_PROGRESS",
        priority: "CRITICAL",
        dueDate: "2024-11-30",
        sortOrder: 2,
      });
      expect(result.success).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// taskListQuerySchema
// ---------------------------------------------------------------------------

describe("validateTaskListQuery", () => {
  // ---- Defaults -----------------------------------------------------------

  describe("defaults", () => {
    it("applies sortBy=sortOrder when omitted", () => {
      const result = validateTaskListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.sortBy).toBe("sortOrder");
    });

    it("applies sortOrder=asc when omitted", () => {
      const result = validateTaskListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.sortOrder).toBe("asc");
    });

    it("applies page=1 when omitted", () => {
      const result = validateTaskListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.page).toBe(1);
    });

    it("applies pageSize=20 when omitted", () => {
      const result = validateTaskListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.pageSize).toBe(20);
    });

    it("applies includeArchived=false when omitted", () => {
      const result = validateTaskListQuery({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe(false);
    });
  });

  // ---- Coercion -----------------------------------------------------------

  describe("string coercion (query params arrive as strings)", () => {
    it("coerces page from string to number", () => {
      const result = validateTaskListQuery({ page: "3" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.page).toBe(3);
    });

    it("coerces pageSize from string to number", () => {
      const result = validateTaskListQuery({ pageSize: "50" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.pageSize).toBe(50);
    });

    it('coerces includeArchived "true" string to boolean true', () => {
      const result = validateTaskListQuery({ includeArchived: "true" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe(true);
    });

    it('coerces includeArchived "false" string to boolean false', () => {
      const result = validateTaskListQuery({ includeArchived: "false" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe(false);
    });

    it("accepts boolean true for includeArchived", () => {
      const result = validateTaskListQuery({ includeArchived: true });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe(true);
    });
  });

  // ---- Invalid values -----------------------------------------------------

  describe("invalid values", () => {
    it("fails on an invalid status filter", () => {
      const result = validateTaskListQuery({ status: "INVALID" });
      expect(result.success).toBe(false);
    });

    it("fails on an invalid priority filter", () => {
      const result = validateTaskListQuery({ priority: "EXTREME" });
      expect(result.success).toBe(false);
    });

    it("fails on an invalid sortBy value", () => {
      const result = validateTaskListQuery({ sortBy: "name" });
      expect(result.success).toBe(false);
    });

    it("fails on an invalid sortOrder value", () => {
      const result = validateTaskListQuery({ sortOrder: "ascending" });
      expect(result.success).toBe(false);
    });

    it("fails when page is 0", () => {
      const result = validateTaskListQuery({ page: "0" });
      expect(result.success).toBe(false);
    });

    it("fails when pageSize is 0", () => {
      const result = validateTaskListQuery({ pageSize: "0" });
      expect(result.success).toBe(false);
    });

    it("fails when pageSize exceeds 100", () => {
      const result = validateTaskListQuery({ pageSize: "101" });
      expect(result.success).toBe(false);
    });

    it("fails when projectId is an empty string", () => {
      const result = validateTaskListQuery({ projectId: "" });
      expect(result.success).toBe(false);
    });

    it("fails when assigneeId is an empty string", () => {
      const result = validateTaskListQuery({ assigneeId: "" });
      expect(result.success).toBe(false);
    });
  });

  // ---- Valid payloads -----------------------------------------------------

  describe("valid payloads", () => {
    it("passes with an empty query object", () => {
      const result = validateTaskListQuery({});
      expect(result.success).toBe(true);
    });

    it("passes with all valid filter params", () => {
      const result = validateTaskListQuery({
        projectId: "project-1",
        search: "kanban",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: "user-1",
        sortBy: "priority",
        sortOrder: "desc",
        page: "2",
        pageSize: "10",
        includeArchived: "true",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.projectId).toBe("project-1");
        expect(result.data.search).toBe("kanban");
        expect(result.data.status).toBe("IN_PROGRESS");
        expect(result.data.priority).toBe("HIGH");
        expect(result.data.assigneeId).toBe("user-1");
        expect(result.data.sortBy).toBe("priority");
        expect(result.data.sortOrder).toBe("desc");
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(10);
        expect(result.data.includeArchived).toBe(true);
      }
    });

    it("accepts pageSize at the upper boundary (100)", () => {
      const result = validateTaskListQuery({ pageSize: "100" });
      expect(result.success).toBe(true);
    });

    it("accepts all valid sortBy values", () => {
      const fields = [
        "title",
        "createdAt",
        "updatedAt",
        "priority",
        "dueDate",
        "sortOrder",
        "status",
      ];
      for (const sortBy of fields) {
        const result = validateTaskListQuery({ sortBy });
        expect(result.success).toBe(true);
      }
    });
  });
});
