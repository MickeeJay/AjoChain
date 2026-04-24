"use client";

import { AlertTriangle } from "lucide-react";
import { useMiniPay } from "@/hooks/useMiniPay";

type NetworkMismatchNoticeProps = {
  className?: string;
};

export function NetworkMismatchNotice({ className }: NetworkMismatchNoticeProps) {
  const { isWrongNetwork, switchToCeloMainnet, isConnecting } = useMiniPay();

  if (!isWrongNetwork) {
    return null;
  }

  return (
    <section className={["rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900", className ?? ""].join(" ")}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden="true" />
        <div className="space-y-3">
          <p className="text-sm font-semibold">Wallet network mismatch</p>
          <p className="text-sm leading-6 text-amber-800">Switch your wallet to Celo Mainnet (42220) before creating, joining, or contributing to groups.</p>
          <button
            type="button"
            onClick={() => void switchToCeloMainnet()}
            disabled={isConnecting}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isConnecting ? "Switching" : "Switch to Celo Mainnet"}
          </button>
        </div>
      </div>
    </section>
  );
}
