/**
 * Jest setupFiles entry — runs before any test file is loaded.
 *
 * Forces an isolated SQLite DATABASE_URL so accidental `npx jest` invocations
 * cannot mutate the developer database (prisma/dev.db).
 */

process.env.NODE_ENV = "test";

const FORCED_TEST_URL = process.env.TEST_DATABASE_URL || "file:./test.db";
const currentUrl = process.env.DATABASE_URL || "";

const pointsAtDevDb = /(^|[/?#]|\\)dev\.db(\?|$)/i.test(
  currentUrl.replace(/\\/g, "/"),
);

if (!currentUrl || pointsAtDevDb) {
  process.env.DATABASE_URL = FORCED_TEST_URL;
}

if (/(^|[/?#]|\\)dev\.db(\?|$)/i.test((process.env.DATABASE_URL || "").replace(/\\/g, "/"))) {
  throw new Error(
    "Refusing to run Jest against the developer SQLite database (dev.db). " +
      "Use `npm test` in backend/ (isolates to file:./test.db).",
  );
}
