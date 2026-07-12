import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import { AppProviders } from "@/app/providers";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  title: {
    default: "AI Project Tracker Pro",
    template: "%s · AI Project Tracker Pro",
  },
  description:
    "Centralized project tracking dashboard for delivery visibility, Kanban workflows, and portfolio analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ibmPlexSans.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
