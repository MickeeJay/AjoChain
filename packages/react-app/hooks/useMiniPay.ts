"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

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

  useEffect(() => {
    const detected = Boolean(window.ethereum?.isMiniPay);
    setIsMiniPay(detected);
    setIsReady(true);
  }, []);

  return {
    isMiniPay,
    isReady,
    isConnected,
  };
}
