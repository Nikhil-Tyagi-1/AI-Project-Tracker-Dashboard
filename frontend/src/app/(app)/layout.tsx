import { AppShell } from "@/components/layout";

/**
 * Authenticated/workspace route group layout.
 * Wraps all primary app pages with the reusable shell (top bar + side nav).
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
