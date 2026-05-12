import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create Group",
  description: "Set up a new rotating savings circle on Celo with cUSD contributions and automated payouts.",
};

export default function CreateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
