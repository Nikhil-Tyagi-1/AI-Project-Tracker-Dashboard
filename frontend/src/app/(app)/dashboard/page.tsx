import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Dashboard route placeholder — feature content is implemented in Milestone 8.
 */
export default function DashboardPage() {
  return (
    <PagePlaceholder
      title="Dashboard"
      description="Portfolio metrics, recent activity, charts, and Smart Insights will appear here once the dashboard feature is implemented."
    />
  );
}
