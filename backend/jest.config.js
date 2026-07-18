/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  // Force isolated DATABASE_URL before any module (including Prisma) loads.
  setupFiles: ["<rootDir>/jest.setupEnv.js"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  // SQLite does not handle concurrent writers well across Jest workers.
  maxWorkers: 1,
  watchman: false,
};
