import { configureStore } from "@reduxjs/toolkit";

import { projectsReducer } from "@/store/slices/projectsSlice";
import { tasksReducer } from "@/store/slices/tasksSlice";
import { uiReducer } from "@/store/slices/uiSlice";

/**
 * Root store factory for Next.js App Router.
 * Use `makeStore` per request/client tree to avoid sharing state across navigations.
 *
 * Register feature slices here as domains are implemented:
 * projects (Milestone 6), tasks (Milestone 7), dashboard (Milestone 8).
 */
export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
      projects: projectsReducer,
      tasks: tasksReducer,
      // dashboard: dashboardReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
