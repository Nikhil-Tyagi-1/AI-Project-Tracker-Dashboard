import type { Request, Response } from "express";
import { ValidationError } from "../lib/errors";
import { successResponse } from "../lib/response";
import { asyncHandler } from "../lib/asyncHandler";
import * as ProjectService from "../services/project";
import {
  validateCreateProject,
  validateUpdateProject,
  validateProjectListQuery,
} from "../validators/project";

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
// list  GET /api/projects
// ---------------------------------------------------------------------------

export const list = asyncHandler(async (req: Request, res: Response) => {
  const parsed = validateProjectListQuery(req.query);

  if (!parsed.success) {
    throw new ValidationError("Invalid query parameters", zodToDetails(parsed.error));
  }

  const result = await ProjectService.listProjects(parsed.data);

  successResponse(res, result.data, result.meta);
});

// ---------------------------------------------------------------------------
// getById  GET /api/projects/:id
// ---------------------------------------------------------------------------

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const project = await ProjectService.getProjectById(id);

  successResponse(res, project);
});

// ---------------------------------------------------------------------------
// create  POST /api/projects
// ---------------------------------------------------------------------------

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = validateCreateProject(req.body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", zodToDetails(parsed.error));
  }

  const project = await ProjectService.createProject(parsed.data);

  successResponse(res, project, 201);
});

// ---------------------------------------------------------------------------
// update  PATCH /api/projects/:id
// ---------------------------------------------------------------------------

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsed = validateUpdateProject(req.body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed", zodToDetails(parsed.error));
  }

  const project = await ProjectService.updateProject(id, parsed.data);

  successResponse(res, project);
});

// ---------------------------------------------------------------------------
// archive  POST /api/projects/:id/archive
// ---------------------------------------------------------------------------

export const archive = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const project = await ProjectService.archiveProject(id);

  successResponse(res, project);
});

// ---------------------------------------------------------------------------
// restore  POST /api/projects/:id/restore
// ---------------------------------------------------------------------------

export const restore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const project = await ProjectService.restoreProject(id);

  successResponse(res, project);
});
