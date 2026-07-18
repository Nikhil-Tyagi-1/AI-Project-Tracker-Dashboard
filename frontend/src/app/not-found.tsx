import type { Metadata } from "next";

import { NotFoundView } from "@/components/layout/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * Global custom 404 for unmatched App Router paths.
 * Renders inside the app shell for consistent navigation.
 */
export default function NotFoundPage() {
  return <NotFoundView />;
}
