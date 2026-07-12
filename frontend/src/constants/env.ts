/**
 * Public environment configuration.
 * Only NEXT_PUBLIC_* values are available in the browser.
 */
function requirePublicEnv(name: "NEXT_PUBLIC_API_BASE_URL"): string {
  const value = process.env[name];

  if (!value) {
    // Fall back for local scaffolding so the app can boot before .env.local exists.
    if (name === "NEXT_PUBLIC_API_BASE_URL") {
      return "http://localhost:4000/api";
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  apiBaseUrl: requirePublicEnv("NEXT_PUBLIC_API_BASE_URL"),
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
