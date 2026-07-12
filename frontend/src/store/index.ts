import { configureStore } from "@reduxjs/toolkit";

import { uiReducer } from "@/store/slices/uiSlice";

/**
 * Root store scaffolding.
 * Register feature slices here as domains are implemented (projects, tasks, dashboard).
 */
export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
      // projects: projectsReducer,
      // tasks: tasksReducer,
      // dashboard: dashboardReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
