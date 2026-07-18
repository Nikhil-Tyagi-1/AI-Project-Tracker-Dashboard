import type { Metadata } from "next";

import { DashboardView } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Dashboard route — portfolio metric cards from `/api/dashboard/summary`.
 * Charts and Smart Insights land in follow-up Milestone 8 work.
 */
export default function DashboardPage() {
  return <DashboardView />;
}
