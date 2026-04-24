"use client";

import { Loader2, Wallet } from "lucide-react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { cn } from "@/lib/utils";

type ConnectWalletButtonProps = {
  className?: string;
  fullWidth?: boolean;
  miniPayLabel?: string;
  defaultLabel?: string;
  isMiniPay?: boolean;
};

export function ConnectWalletButton({
  className,
  fullWidth = false,
  miniPayLabel = "Open MiniPay",
  defaultLabel = "Connect wallet",
  isMiniPay = false,
}: ConnectWalletButtonProps) {
  const { connectWallet, isConnecting } = useMiniPay();

  const handleConnect = () => {
    void connectWallet();
  };

  const label = isConnecting ? "Connecting wallet" : isMiniPay ? miniPayLabel : defaultLabel;

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isConnecting}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70",
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wallet className="h-4 w-4" aria-hidden="true" />}
      {label}
    </button>
  );
}
