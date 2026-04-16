"use client";

import { useEffect, useState } from "react";

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const provider = window as Window & {
      ethereum?: {
        isMiniPay?: boolean;
      };
    };

    const detected = Boolean(provider.ethereum?.isMiniPay) || navigator.userAgent.toLowerCase().includes("minipay");
    setIsMiniPay(detected);
    setIsReady(true);
  }, []);

  return {
    isMiniPay,
    isReady,
  };
}
