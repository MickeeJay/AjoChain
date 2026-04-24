"use client";

import { lazy, Suspense } from "react";
import { HomeDashboardSkeleton } from "@/components/home/HomeDashboardSkeleton";
import { HomeLanding } from "@/components/home/HomeLanding";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { useMiniPay } from "@/hooks/useMiniPay";

const HomeDashboardContent = lazy(() => import("@/components/home/HomeDashboardContent").then((module) => ({ default: module.HomeDashboardContent })));

export default function HomePage() {
  const { isMiniPay, isLoading, isConnected, chainId, isWrongNetwork, switchToCeloMainnet, error, isConnecting } = useMiniPay();

  if (isLoading) {
    return <HomeDashboardSkeleton />;
  }

  if (!isConnected && !isMiniPay) {
    return <HomeLanding isMiniPay={isMiniPay} />;
  }

  if (!isConnected && isMiniPay) {
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_16px_40px_rgba(16,42,44,0.08)]">
        <p className="text-lg font-semibold">MiniPay detected</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Connect your MiniPay wallet to load your dashboard groups and cUSD balance.</p>
        <ConnectWalletButton isMiniPay fullWidth className="mt-5" />
        {error ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
      </section>
    );
  }

  if (isMiniPay && isConnected && isWrongNetwork && chainId !== undefined) {
    return (
      <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-[0_16px_40px_rgba(146,64,14,0.08)]">
        <p className="text-lg font-semibold">Switch MiniPay to Celo Mainnet</p>
        <p className="mt-2 text-sm leading-6">
          AjoChain transactions are configured for Celo Mainnet (42220). Accept the wallet prompt to switch networks and continue.
        </p>
        <button
          type="button"
          onClick={() => void switchToCeloMainnet()}
          disabled={isConnecting}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isConnecting ? "Switching network" : "Switch to Celo Mainnet"}
        </button>
        {error ? <p className="mt-3 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900">{error}</p> : null}
      </section>
    );
  }

  return (
    <Suspense fallback={<HomeDashboardSkeleton />}>
      <HomeDashboardContent />
    </Suspense>
  );
}
