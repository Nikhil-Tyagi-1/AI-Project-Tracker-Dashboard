import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import healthRouter from "./routes/health";

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

  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", healthRouter);

  // Must be registered after all routes.
  app.use(errorHandler);

  return app;
}
