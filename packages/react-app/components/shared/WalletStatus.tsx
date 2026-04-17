"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMiniPay } from "@/hooks/useMiniPay";

export function WalletStatus() {
  const { isMiniPay, isConnected, isReady, address, chainId } = useMiniPay();
  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const chainLabel = chainId === 44787 ? "Alfajores" : "Celo";

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
        <span>MiniPay {isConnected ? "connected" : "connecting"}</span>
        {isConnected && shortAddress ? <span className="hidden sm:inline font-medium text-emerald-700/80">{shortAddress} on {chainLabel}</span> : null}
      </div>
    );
  }

  return <ConnectButton accountStatus="address" chainStatus="icon" label="Connect wallet" showBalance={false} />;
}