import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your on-chain savings identity, reputation score, and verifiable credentials on AjoChain.",
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
