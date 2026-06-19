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
    <section
      className={[
        "rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden="true" />
        <div className="space-y-3">
          <p className="text-sm font-semibold">Wrong network selected</p>
          <p className="text-sm leading-6 text-amber-800 dark:text-amber-100/80">
            Your wallet is connected to the wrong network. Tap below to switch to the correct one so you can save, join groups, and receive payouts.
          </p>
          <button
            type="button"
            onClick={() => void switchToCeloMainnet()}
            disabled={isConnecting}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
          >
            {isConnecting ? "Switching..." : "Switch to Celo Network"}
          </button>
        </div>
      </div>
    </section>
  );
}
