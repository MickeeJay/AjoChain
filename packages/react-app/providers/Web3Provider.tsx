"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { http } from "wagmi";
import { celoAlfajores, celoMainnet } from "@/lib/celo";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

const wagmiConfig = createConfig({
  chains: [celoMainnet, celoAlfajores],
  transports: {
    [celoMainnet.id]: http(celoMainnet.rpcUrls.default.http[0]),
    [celoAlfajores.id]: http(celoAlfajores.rpcUrls.default.http[0]),
  },
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

  const privyTheme = useMemo(() => {
    return resolvedTheme === "dark" ? "dark" : "light";
  }, [resolvedTheme]);

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: privyTheme,
          accentColor: "#35D07F",
          logo: "/android-chrome-192x192.png",
          walletChainType: "ethereum-only",
        },
        loginMethods: ["email", "wallet"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: celoMainnet,
        supportedChains: [celoMainnet, celoAlfajores],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}