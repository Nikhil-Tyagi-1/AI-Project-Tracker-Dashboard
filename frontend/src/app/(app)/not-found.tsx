import type { Metadata } from "next";

import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * 404 within the `(app)` route group — shell chrome comes from `(app)/layout`.
 */
export default function AppNotFoundPage() {
  return <NotFoundContent />;
}
