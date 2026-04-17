"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMiniPay } from "@/hooks/useMiniPay";

export function WalletStatus() {
  const { isMiniPay, isConnected, isReady } = useMiniPay();

  if (!isReady) {
    return (
      <div className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-medium text-slate-400">
        Checking wallet status
      </div>
    );
  }

  if (isMiniPay) {
    return (
      <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        MiniPay {isConnected ? "connected" : "connecting"}
      </div>
    );
  }

  return <ConnectButton accountStatus="address" chainStatus="icon" label="Connect wallet" showBalance={false} />;
}