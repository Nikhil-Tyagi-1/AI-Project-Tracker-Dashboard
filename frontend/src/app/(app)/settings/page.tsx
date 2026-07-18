import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout";

export const metadata: Metadata = {
  title: "Settings",
};

/**
 * Settings route placeholder — content deferred beyond current MVP feature milestones.
 */
export default function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Workspace preferences and configuration options will be added here. No settings are required for the current MVP."
    />
  );
}
