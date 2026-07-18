/**
 * Backend test runner — isolated SQLite + CI-friendly Jest.
 *
 * Guarantees:
 *   - Always uses prisma/test.db (never prisma/dev.db)
 *   - Applies migrations before Jest
 *   - Deletes the ephemeral test DB (and SQLite sidecars) after the run
 *
 * Usage (from backend/):
 *   npm test
 *   npm test -- --testPathPatterns=routes/project
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const prismaDir = path.join(backendRoot, "prisma");

/** Relative URL resolved by Prisma against the prisma/ directory. */
const TEST_DATABASE_URL = "file:./test.db";
const TEST_DB_BASENAME = "test.db";

const testDbPath = path.join(prismaDir, TEST_DB_BASENAME);
const sidecarSuffixes = ["-journal", "-wal", "-shm"];

function removeIfExists(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function cleanupTestDatabase() {
  removeIfExists(testDbPath);
  for (const suffix of sidecarSuffixes) {
    removeIfExists(`${testDbPath}${suffix}`);
  }
}

function assertSafeDatabaseUrl(url) {
  const normalized = url.replace(/\\/g, "/").toLowerCase();
  if (normalized.includes("dev.db")) {
    console.error(
      "[test] Refusing to run tests: DATABASE_URL points at the developer database (dev.db).",
    );
    console.error(`[test] Received: ${url}`);
    console.error(`[test] Expected an isolated URL such as ${TEST_DATABASE_URL}`);
    process.exit(1);
  }
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: backendRoot,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

const forwardedArgs = process.argv.slice(2);

const env = {
  ...process.env,
  NODE_ENV: "test",
  DATABASE_URL: TEST_DATABASE_URL,
  // Hint for jest.setupEnv.js — never fall back to a caller-supplied dev.db.
  TEST_DATABASE_URL,
};

assertSafeDatabaseUrl(env.DATABASE_URL);

cleanupTestDatabase();

console.log(`[test] Using isolated SQLite database: ${TEST_DATABASE_URL}`);
console.log("[test] Applying migrations (prisma migrate deploy)…");

const migrateStatus = run("npx", ["prisma", "migrate", "deploy"], env);
if (migrateStatus !== 0) {
  cleanupTestDatabase();
  process.exit(migrateStatus);
}

const jestArgs = [
  "jest",
  "--runInBand",
  "--watchman=false",
  ...(process.env.CI ? ["--ci", "--colors=false"] : []),
  ...forwardedArgs,
];

console.log(`[test] Running Jest: npx ${jestArgs.join(" ")}`);

let jestStatus = 1;
try {
  jestStatus = run("npx", jestArgs, env);
} finally {
  console.log("[test] Cleaning up ephemeral test database…");
  cleanupTestDatabase();
}

process.exit(jestStatus);
