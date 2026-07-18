import type { Request, Response } from "express";
import { successResponse } from "../lib/response";
import { asyncHandler } from "../lib/asyncHandler";
import * as DashboardService from "../services/dashboard";

// ---------------------------------------------------------------------------
// getSummary  GET /api/dashboard/summary
// ---------------------------------------------------------------------------

/**
 * Return portfolio metric cards and chart-ready series.
 * Business logic lives entirely in DashboardService.getSummary.
 */
export const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await DashboardService.getSummary();

  successResponse(res, summary);
});

// ---------------------------------------------------------------------------
// getInsights  GET /api/dashboard/insights
// ---------------------------------------------------------------------------

/**
 * Return mock Smart Insights derived from current database data.
 * Business logic lives entirely in DashboardService.getInsights.
 */
export const getInsights = asyncHandler(async (_req: Request, res: Response) => {
  const insights = await DashboardService.getInsights();

  successResponse(res, insights);
});
