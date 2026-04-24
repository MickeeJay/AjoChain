import type { Metadata, Viewport } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Web3Provider } from "@/providers/Web3Provider";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

const bodyFont = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ajochain.app";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: "AjoChain",
  description: "MiniPay-native rotating savings groups on Celo.",
  openGraph: {
    title: "AjoChain",
    description: "MiniPay-native rotating savings groups on Celo.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/api/og?title=AjoChain&subtitle=MiniPay-native%20rotating%20savings%20groups%20on%20Celo.",
        width: 1200,
        height: 630,
        alt: "AjoChain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AjoChain",
    description: "MiniPay-native rotating savings groups on Celo.",
    images: ["/api/og?title=AjoChain&subtitle=MiniPay-native%20rotating%20savings%20groups%20on%20Celo."],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="talentapp:project_verification"
          content="d43002d56c192d6b0898d0034f00212acf3905feffeca2d8598da47cd3a9cea2b1cc29c43ba8dbbd28fe043fae644923d0f0f1855a85dd719152b4e9aa877911"
        />
      </head>
      <body className={`${bodyFont.className} ${displayFont.variable} bg-white text-gray-900`}>
        <Web3Provider>
          <AppShell>{children}</AppShell>
        </Web3Provider>
      </body>
    </html>
  );
}
