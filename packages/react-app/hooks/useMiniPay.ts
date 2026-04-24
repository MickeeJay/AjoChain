"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Wallet action failed. Please try again.";
}

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<`0x${string}` | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const { address: wagmiAddress, chainId: wagmiChainId, isConnected: wagmiIsConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const hasAttemptedConnectorSyncRef = useRef(false);

  useEffect(() => {
    const provider = window.ethereum;
    const detected = Boolean(provider?.isMiniPay);
    setIsMiniPay(detected);

    if (!provider) {
      setIsLoading(false);
      return;
    }

    const syncWalletState = async () => {
      setIsLoading(true);

      try {
        const [accountsResponse, rawChainId] = await Promise.all([
          provider.request({ method: "eth_accounts" }),
          provider.request({ method: "eth_chainId" }),
        ]);

        const accounts = Array.isArray(accountsResponse) ? accountsResponse : [];
        const primaryAddress = typeof accounts[0] === "string" ? (accounts[0] as `0x${string}`) : undefined;

        setAddress(primaryAddress);
        setChainId(parseChainId(rawChainId));

        if (primaryAddress && !wagmiIsConnected && !hasAttemptedConnectorSyncRef.current) {
          hasAttemptedConnectorSyncRef.current = true;
          const injectedConnector = connectors.find((connector) => connector.id === "injected");

          if (injectedConnector) {
            await connectAsync({ connector: injectedConnector });
          }
        }
      } catch (syncError) {
        setError(getErrorMessage(syncError));
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

    void syncWalletState();
    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [connectAsync, connectors, wagmiIsConnected]);

  const connectWallet = useCallback(async () => {
    const provider = window.ethereum;

    if (!provider) {
      setError("No supported wallet provider was detected.");
      return false;
    }

    try {
      setError(null);
      setIsConnecting(true);
      const requestedAccounts = await provider.request({ method: "eth_requestAccounts" });
      const accounts = Array.isArray(requestedAccounts) ? requestedAccounts : [];
      const primaryAddress = typeof accounts[0] === "string" ? (accounts[0] as `0x${string}`) : undefined;

      setAddress(primaryAddress);
      const rawChainId = await provider.request({ method: "eth_chainId" });
      setChainId(parseChainId(rawChainId));

      if (!wagmiIsConnected) {
        const injectedConnector = connectors.find((connector) => connector.id === "injected");

        if (injectedConnector) {
          await connectAsync({ connector: injectedConnector });
        }
      }

      return true;
    } catch (connectError) {
      setError(getErrorMessage(connectError));
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [connectAsync, connectors, wagmiIsConnected]);

  const switchToCeloMainnet = useCallback(async () => {
    const provider = window.ethereum;

    if (!provider) {
      setError("No wallet provider is available to switch networks.");
      return false;
    }

    try {
      setError(null);
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CELO_MAINNET_HEX_CHAIN_ID }],
      });

      const switchedChainId = parseChainId(await provider.request({ method: "eth_chainId" }));
      setChainId(switchedChainId);
      return true;
    } catch (switchError) {
      setError(getErrorMessage(switchError));
      return false;
    }
  }, []);

  const resolvedAddress = address ?? wagmiAddress;
  const resolvedChainId = chainId ?? wagmiChainId;
  const isConnected = Boolean(resolvedAddress);
  const isWrongNetwork = Boolean(isConnected && resolvedChainId !== undefined && resolvedChainId !== CELO_MAINNET_CHAIN_ID);

  return {
    isMiniPay,
    isLoading,
    isConnecting: isConnecting || isPending,
    isConnected,
    isWrongNetwork,
    connectWallet,
    switchToCeloMainnet,
    address: resolvedAddress,
    chainId: resolvedChainId,
    error,
  };
}
