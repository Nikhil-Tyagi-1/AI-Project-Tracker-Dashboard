import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Kanban",
};

/**
 * Kanban route placeholder — feature content is implemented in Milestone 7.
 */
export default function KanbanPage() {
  return (
    <PagePlaceholder
      title="Kanban"
      description="Drag-and-drop task boards with TODO, In Progress, In Review, and Done columns will be available here in a later milestone."
    />
  );
}
