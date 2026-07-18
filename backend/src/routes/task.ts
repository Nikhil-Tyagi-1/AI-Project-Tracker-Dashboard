import { Router } from "express";
import * as TaskController from "../controllers/task";

const router = Router();

// GET /api/tasks
router.get("/", TaskController.list);

// GET /api/tasks/:id
router.get("/:id", TaskController.getById);

// POST /api/tasks
router.post("/", TaskController.create);

// PATCH /api/tasks/:id
router.patch("/:id", TaskController.update);

// PATCH /api/tasks/:id/archive
router.patch("/:id/archive", TaskController.archive);

// PATCH /api/tasks/:id/restore
router.patch("/:id/restore", TaskController.restore);

export default router;
