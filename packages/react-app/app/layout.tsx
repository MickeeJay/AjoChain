import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Web3Provider } from "@/providers/Web3Provider";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AjoChain",
  description: "MiniPay-native rotating savings groups on Celo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-gray-900">
        <Web3Provider>
          <AppShell>{children}</AppShell>
        </Web3Provider>
      </body>
    </html>
  );
}
