import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "New Project",
};

/**
 * Create-project placeholder — form is implemented later in Milestone 6.
 */
export default function NewProjectPage() {
  return (
    <PagePlaceholder
      title="New Project"
      description="The create-project form (React Hook Form + Zod) will live here in a later step."
    />
  );
}
