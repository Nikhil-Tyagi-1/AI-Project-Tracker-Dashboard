import type { Metadata } from "next";

import { ProjectEditView } from "@/features/projects";

export const metadata: Metadata = {
  title: "Edit Project",
};

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Edit project route — reuses ProjectForm with loaded project defaults.
 */
export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  return <ProjectEditView projectId={id} />;
}
