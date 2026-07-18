import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Analytics",
};

/**
 * Analytics route placeholder — feature content is implemented in Milestone 8.
 */
export default function AnalyticsPage() {
  return (
    <PagePlaceholder
      title="Analytics"
      description="Deeper chart views for project progress, task status, team workload, and monthly activity will render here in a later milestone."
    />
  );
}
