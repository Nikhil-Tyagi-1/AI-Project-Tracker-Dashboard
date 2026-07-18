import { Router } from "express";
import pkg from "../../package.json";
import { successResponse } from "../lib/response";

const router = Router();

router.get("/health", (_req, res) => {
  successResponse(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: pkg.version,
  });
});

export default router;
