"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Web3Provider } from "@/providers/Web3Provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SessionProvider>
        <Web3Provider>{children}</Web3Provider>
      </SessionProvider>
    </ThemeProvider>
  );
}
