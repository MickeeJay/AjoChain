import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Groups",
  description: "View your rotating savings circles, track contributions, and manage group cycles on AjoChain.",
};

export default function GroupsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
