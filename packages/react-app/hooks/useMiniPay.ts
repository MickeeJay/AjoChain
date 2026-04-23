"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect } from "wagmi";

declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (eventName: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (eventName: string, listener: (...args: unknown[]) => void) => void;
    };
  }
}

const CELO_MAINNET_CHAIN_ID = 42220;
const CELO_MAINNET_HEX_CHAIN_ID = "0xa4ec";

let hasAttemptedMiniPayAutoConnect = false;

function parseChainId(rawChainId: unknown) {
  if (typeof rawChainId === "number") {
    return rawChainId;
  }

  if (typeof rawChainId === "string") {
    if (rawChainId.startsWith("0x")) {
      return Number.parseInt(rawChainId, 16);
    }

    return Number.parseInt(rawChainId, 10);
  }

  return undefined;
}

async function promptSwitchToCeloMainnet(provider: NonNullable<Window["ethereum"]>) {
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: CELO_MAINNET_HEX_CHAIN_ID }],
  });
}

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState<`0x${string}` | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const { address: wagmiAddress, chainId: wagmiChainId, isConnected: wagmiIsConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const hasAttemptedConnectRef = useRef(false);
  const hasPromptedSwitchRef = useRef(false);

  useEffect(() => {
    const provider = window.ethereum;
    const detected = Boolean(provider?.isMiniPay);
    setIsMiniPay(detected);

    if (!detected || !provider) {
      setIsLoading(false);
      return;
    }

    const syncMiniPayState = async () => {
      if (hasAttemptedConnectRef.current || hasAttemptedMiniPayAutoConnect) {
        setIsLoading(false);
        return;
      }

      hasAttemptedConnectRef.current = true;
      hasAttemptedMiniPayAutoConnect = true;
      setIsLoading(true);

      try {
        const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
        const rawChainId = await provider.request({ method: "eth_chainId" });
        const resolvedChainId = parseChainId(rawChainId);

        setAddress(accounts?.[0] as `0x${string}` | undefined);
        setChainId(resolvedChainId);

        if (!wagmiIsConnected) {
          const injectedConnector = connectors.find((connector) => connector.id === "injected");

          if (injectedConnector) {
            await connectAsync({ connector: injectedConnector });
          }
        }

        if (resolvedChainId !== CELO_MAINNET_CHAIN_ID && !hasPromptedSwitchRef.current) {
          hasPromptedSwitchRef.current = true;
          await promptSwitchToCeloMainnet(provider);

          const switchedChainId = parseChainId(await provider.request({ method: "eth_chainId" }));
          setChainId(switchedChainId);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleAccountsChanged = (nextAccounts: unknown) => {
      if (!Array.isArray(nextAccounts)) {
        setAddress(undefined);
        return;
      }

      const nextAddress = nextAccounts[0];
      setAddress(typeof nextAddress === "string" ? (nextAddress as `0x${string}`) : undefined);
    };

    const handleChainChanged = (nextChainId: unknown) => {
      setChainId(parseChainId(nextChainId));
    };

    void syncMiniPayState();
    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [connectAsync, connectors, wagmiIsConnected]);

  const resolvedAddress = address ?? wagmiAddress;
  const resolvedChainId = chainId ?? wagmiChainId;
  const isConnected = Boolean(resolvedAddress);

  return {
    isMiniPay,
    isLoading,
    isConnected,
    address: resolvedAddress,
    chainId: resolvedChainId,
  };
}
