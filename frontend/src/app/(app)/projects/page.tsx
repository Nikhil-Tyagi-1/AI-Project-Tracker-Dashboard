import type { Metadata } from "next";

import { ProjectsListView } from "@/features/projects";

export const metadata: Metadata = {
  title: "Projects",
};

/**
 * Projects list route — search, filter, sort, and open project details.
 */
export default function ProjectsPage() {
  return <ProjectsListView />;
}
