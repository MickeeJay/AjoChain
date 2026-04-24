"use client";

import { Loader2, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useConnect } from "wagmi";
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
  const { connect, connectors, isPending } = useConnect();

  const primaryConnector = useMemo(() => {
    return connectors.find((connector) => connector.id === "injected") ?? connectors[0];
  }, [connectors]);

  const handleConnect = () => {
    if (!primaryConnector) {
      return;
    }

    connect({ connector: primaryConnector });
  };

  const label = isPending ? "Connecting wallet" : isMiniPay ? miniPayLabel : defaultLabel;

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={!primaryConnector || isPending}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70",
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wallet className="h-4 w-4" aria-hidden="true" />}
      {label}
    </button>
  );
}
