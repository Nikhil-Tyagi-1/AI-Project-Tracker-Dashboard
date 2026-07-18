import type { Metadata } from "next";

import { ProjectCreateView } from "@/features/projects";

export const metadata: Metadata = {
  title: "New Project",
};

/**
 * Create project route — React Hook Form + Zod + Redux create action.
 */
export default function NewProjectPage() {
  return <ProjectCreateView />;
}
