import type { Metadata } from "next";

import { AnalyticsView } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Analytics",
};

/**
 * Analytics route — dedicated portfolio chart layout from `/api/dashboard/summary`.
 */
export default function AnalyticsPage() {
  return <AnalyticsView />;
}
