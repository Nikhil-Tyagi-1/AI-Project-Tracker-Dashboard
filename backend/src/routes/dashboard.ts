import { Router } from "express";
import * as DashboardController from "../controllers/dashboard";

const router = Router();

// GET /api/dashboard/summary
router.get("/summary", DashboardController.getSummary);

// GET /api/dashboard/insights
router.get("/insights", DashboardController.getInsights);

export default router;
