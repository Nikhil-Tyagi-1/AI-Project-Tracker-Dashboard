/**
 * Prisma client singleton — backend/src/prisma/client.ts
 *
 * WHY THIS PATTERN IS REQUIRED
 * ─────────────────────────────
 * Node.js module caching normally guarantees a module is evaluated once per
 * process. During development, however, `tsx --watch` (and Next.js Fast
 * Refresh / hot-module replacement in general) re-evaluates module files on
 * every save without restarting the OS process. Each re-evaluation would run
 * `new PrismaClient()` and open a fresh connection-pool to SQLite, leaking
 * connections until the pool is exhausted and the watcher crashes.
 *
 * The fix is to cache the instance on `globalThis`. Unlike module-level
 * variables, `globalThis` is NOT cleared between hot-reloads — it lives for
 * the entire OS process lifetime. We therefore:
 *
 *   1. Check whether a client is already cached on `globalThis`.
 *   2. If yes, reuse it.
 *   3. If no, create one, store it, then return it.
 *
 * We only store on `globalThis` in non-production environments. In production
 * there is no hot-reload, so normal module caching is sufficient and we avoid
 * polluting the global namespace unnecessarily.
 *
 * USAGE
 * ─────
 * import { prisma } from "@/prisma/client";
 * // or from a service:
 * import { prisma } from "../prisma/client";
 *
 * The `Prisma` namespace re-export gives services access to generated types
 * (e.g. `Prisma.ProjectWhereInput`) without a separate @prisma/client import.
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { env } from "../config/env";

// ---------------------------------------------------------------------------
// Log levels
// ---------------------------------------------------------------------------

/**
 * In development, surface warnings and errors.
 * Set DATABASE_DEBUG=true in .env to also log every generated SQL query —
 * useful for optimising filters and spotting N+1 issues, but very noisy.
 */
function resolveLogLevels(): Prisma.LogLevel[] {
  if (env.NODE_ENV === "production") return ["error"];
  if (process.env.DATABASE_DEBUG === "true") return ["query", "info", "warn", "error"];
  return ["warn", "error"];
}

// ---------------------------------------------------------------------------
// Singleton machinery
// ---------------------------------------------------------------------------

/**
 * Augment `globalThis` with a typed slot for the cached client.
 * Using `unknown` cast avoids mutating the global type declaration file.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: resolveLogLevels(),
  });

// Cache the instance in every non-production environment so the next
// hot-reload cycle picks it up instead of creating a new one.
if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

/**
 * Disconnect the client when the process exits so SQLite is not left with an
 * open write-ahead lock. Prisma does not register these handlers by default.
 *
 * We guard with a flag to avoid registering duplicate handlers if this module
 * is somehow evaluated more than once (belt-and-suspenders).
 */
if (!(globalForPrisma as unknown as { _prismaShutdownRegistered?: boolean })._prismaShutdownRegistered) {
  (globalForPrisma as unknown as { _prismaShutdownRegistered: boolean })._prismaShutdownRegistered = true;

  const disconnect = async (signal: string): Promise<void> => {
    await prisma.$disconnect();
    process.kill(process.pid, signal);
  };

  // Remove the listener before re-emitting so the default handler runs after
  // disconnect — this avoids an infinite loop on SIGINT/SIGTERM.
  process.once("SIGINT", () => void disconnect("SIGINT"));
  process.once("SIGTERM", () => void disconnect("SIGTERM"));
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

/**
 * Re-export the `Prisma` namespace so service files can access generated
 * input types (e.g. `Prisma.ProjectWhereInput`, `Prisma.SortOrder`) from a
 * single import rather than importing `@prisma/client` directly in every file.
 */
export { Prisma };
