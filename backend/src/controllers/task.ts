import type { Request, Response } from "express";
import { ValidationError } from "../lib/errors";
import { successResponse } from "../lib/response";
import { asyncHandler } from "../lib/asyncHandler";
import * as TaskService from "../services/task";
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskListQuery,
} from "../validators/task";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map Zod error issues to the { path, message } shape expected by
 * ValidationError and the error response envelope.
 *
 * Zod v4 types issue.path as PropertyKey[] (string | number | symbol);
 * String() normalises all three to a plain string segment.
 */
function zodToDetails(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

// ---------------------------------------------------------------------------
// list  GET /api/tasks
// ---------------------------------------------------------------------------

export const list = asyncHandler(async (req: Request, res: Response) => {
  const parsed = validateTaskListQuery(req.query);

  if (!parsed.success) {
    throw new ValidationError("Invalid query parameters", zodToDetails(parsed.error));
  }

  const result = await TaskService.listTasks(parsed.data);

  successResponse(res, result.data, result.meta);
});

// ---------------------------------------------------------------------------
// getById  GET /api/tasks/:id
// ---------------------------------------------------------------------------

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const task = await TaskService.getTaskById(id);

  successResponse(res, task);
});

// ---------------------------------------------------------------------------
// create  POST /api/tasks
// ---------------------------------------------------------------------------

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = validateCreateTask(req.body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", zodToDetails(parsed.error));
  }

  const task = await TaskService.createTask(parsed.data);

  successResponse(res, task, 201);
});

// ---------------------------------------------------------------------------
// update  PATCH /api/tasks/:id
// ---------------------------------------------------------------------------

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsed = validateUpdateTask(req.body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", zodToDetails(parsed.error));
  }

  const task = await TaskService.updateTask(id, parsed.data);

  successResponse(res, task);
});

// ---------------------------------------------------------------------------
// archive  POST /api/tasks/:id/archive
// ---------------------------------------------------------------------------

export const archive = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const task = await TaskService.archiveTask(id);

  successResponse(res, task);
});

// ---------------------------------------------------------------------------
// restore  POST /api/tasks/:id/restore
// ---------------------------------------------------------------------------

export const restore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const task = await TaskService.restoreTask(id);

  successResponse(res, task);
});
