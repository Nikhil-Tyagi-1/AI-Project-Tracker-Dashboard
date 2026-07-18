import { redirect } from "next/navigation";

import { appRoutes } from "@/constants/routes";

/**
 * Root path redirects into the Dashboard shell route.
 * Page content for Dashboard lands in later milestones.
 */
export default function HomePage() {
  redirect(appRoutes.dashboard);
}
