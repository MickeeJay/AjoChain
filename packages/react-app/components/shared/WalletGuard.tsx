"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";

type WalletGuardProps = {
  children: ReactNode;
};

export function WalletGuard({ children }: WalletGuardProps) {
  const { isConnected, isReady } = useMiniPay();

  if (!isReady) {
    return (
      <div className="rounded-[1.5rem] border border-white/60 bg-white/85 p-6 text-slate-900 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
        <p className="text-lg font-semibold">Checking wallet status</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Preparing the wallet connection state.</p>
      </div>
    );
  }

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-[1.5rem] border border-white/60 bg-white/85 p-6 text-slate-900 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
      <p className="text-lg font-semibold">Connect your wallet to continue</p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Use the connect wallet button in the header before you create or join a savings circle.</p>
      <Link href="/" className="mt-5 inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
        Back home
      </Link>
    </div>
  );
}
