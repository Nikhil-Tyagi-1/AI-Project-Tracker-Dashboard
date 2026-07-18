import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Projects",
};

/**
 * Projects route placeholder — feature content is implemented in Milestone 6.
 */
export default function ProjectsPage() {
  return (
    <PagePlaceholder
      title="Projects"
      description="Create, search, filter, and manage projects from this page in a later milestone. Archive and restore flows will also live here."
    />
  );
}
