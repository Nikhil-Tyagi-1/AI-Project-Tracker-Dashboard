import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Project Details",
};

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Project detail placeholder — full metadata view is implemented later in Milestone 6.
 * Present so list row/card navigation has a valid destination.
 */
export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  return (
    <PagePlaceholder
      title="Project Details"
      description={`Detail view for project ${id} will show metadata, risk notes, task summary, and a link to the Kanban board in a later step.`}
    />
  );
}
