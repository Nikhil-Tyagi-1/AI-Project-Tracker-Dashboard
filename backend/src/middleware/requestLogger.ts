import morgan from "morgan";
import { env } from "../config/env";

// Custom token format: method  url  status  response-time
// Development: morgan "dev" preset — same four fields, coloured by status code.
// Production:  explicit minimal format, no colour codes (stdout is often captured
//              by a log aggregator that does not handle ANSI).
const FORMAT =
  env.NODE_ENV === "production"
    ? ":method :url :status :response-time ms"
    : "dev";

export const requestLogger = morgan(FORMAT);
