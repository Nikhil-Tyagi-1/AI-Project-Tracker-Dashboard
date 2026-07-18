import type { Metadata } from "next";

import { ProjectDetailView } from "@/features/projects";

export const metadata: Metadata = {
  title: "Project Details",
};

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Project detail route — metadata, task summary, edit/archive/restore.
 */
export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  return <ProjectDetailView projectId={id} />;
}
