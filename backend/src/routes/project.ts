import { Router } from "express";
import * as ProjectController from "../controllers/project";

const router = Router();

// GET /api/projects
router.get("/", ProjectController.list);

// GET /api/projects/:id
router.get("/:id", ProjectController.getById);

// POST /api/projects
router.post("/", ProjectController.create);

// PATCH /api/projects/:id
router.patch("/:id", ProjectController.update);

// PATCH /api/projects/:id/archive
router.patch("/:id/archive", ProjectController.archive);

// PATCH /api/projects/:id/restore
router.patch("/:id/restore", ProjectController.restore);

export default router;
