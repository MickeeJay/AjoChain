"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import type { ReactNode } from "react";
import { useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { celoAlfajores, celoMainnet } from "@/lib/celo";

const wagmiConfig = createConfig({
  chains: [celoMainnet, celoAlfajores],
  connectors: [injected(), metaMask()],
  transports: {
    [celoMainnet.id]: http(celoMainnet.rpcUrls.default.http[0]),
    [celoAlfajores.id]: http(celoAlfajores.rpcUrls.default.http[0]),
  },
  ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#07955f",
            accentColorForeground: "white",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}