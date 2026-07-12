import axios from "axios";

import { env } from "@/constants/env";

/**
 * Shared Axios instance for all API modules under src/services.
 * Feature services should import `apiClient` instead of creating their own clients.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Central place for future auth redirects / normalized error mapping.
    return Promise.reject(error);
  },
);
