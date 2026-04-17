"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect } from "wagmi";

declare global {
  interface Window {
    ethereum?: {
      isMiniPay?: boolean;
    };
  }
}

let hasAttemptedMiniPayAutoConnect = false;

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const hasAttemptedConnectRef = useRef(false);

  useEffect(() => {
    const detected = Boolean(window.ethereum?.isMiniPay);
    setIsMiniPay(detected);
    setIsReady(true);

    if (!detected || isConnected || hasAttemptedConnectRef.current || hasAttemptedMiniPayAutoConnect) {
      return;
    }

    const injectedConnector = connectors.find((connector) => connector.id === "injected");
    if (!injectedConnector) {
      return;
    }

    hasAttemptedConnectRef.current = true;
    hasAttemptedMiniPayAutoConnect = true;
    void connect({ connector: injectedConnector });
  }, []);

  return {
    isMiniPay,
    isReady,
    isConnected,
    address,
    chainId,
  };
}
