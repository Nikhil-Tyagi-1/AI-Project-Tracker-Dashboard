import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env";

/**
 * Express application factory.
 * Middleware only — route modules are mounted when APIs are implemented.
 */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );

  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // API routes will be mounted under /api in a later milestone.
  // Example: app.use("/api", apiRouter);

  return app;
}
