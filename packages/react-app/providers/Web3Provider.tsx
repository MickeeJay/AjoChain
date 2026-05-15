"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { celoAlfajores, celoMainnet } from "@/lib/celo";

const wagmiConfig = createConfig({
  chains: [celoMainnet, celoAlfajores],
  connectors: [injected()],
  transports: {
    [celoMainnet.id]: http(celoMainnet.rpcUrls.default.http[0]),
    [celoAlfajores.id]: http(celoAlfajores.rpcUrls.default.http[0]),
  },
  ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
          },
        },
      }),
  );

  const rainbowTheme = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    const buildTheme = isDark ? darkTheme : lightTheme;

    return buildTheme({
      accentColor: "#35D07F",
      accentColorForeground: isDark ? "#0b1412" : "white",
      borderRadius: "large",
    });
  }, [resolvedTheme]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}