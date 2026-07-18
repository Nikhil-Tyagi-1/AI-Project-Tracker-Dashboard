"use client";

import { AppShell } from "@/components/layout/AppShell";
import { NotFoundContent } from "@/components/layout/NotFoundContent";

/**
 * Root-level 404 view with shell chrome (root `not-found` has no `(app)` layout).
 */
export function NotFoundView() {
  return (
    <AppShell>
      <NotFoundContent />
    </AppShell>
  );
}
