"use client";

import { lazy, Suspense } from "react";
import { HomeDashboardSkeleton } from "@/components/home/HomeDashboardSkeleton";
import { HomeLanding } from "@/components/home/HomeLanding";
import { useMiniPay } from "@/hooks/useMiniPay";

const HomeDashboardContent = lazy(() => import("@/components/home/HomeDashboardContent").then((module) => ({ default: module.HomeDashboardContent })));

export default function HomePage() {
  const { isMiniPay, isLoading, isConnected, chainId } = useMiniPay();

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
        <p className="mt-2 text-sm leading-6 text-slate-600">Connecting your MiniPay wallet so your dashboard can load your groups and balances.</p>
      </section>
    );
  }

  if (isMiniPay && isConnected && chainId !== undefined && chainId !== 42220) {
    return (
      <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-[0_16px_40px_rgba(146,64,14,0.08)]">
        <p className="text-lg font-semibold">Switch MiniPay to Celo Mainnet</p>
        <p className="mt-2 text-sm leading-6">
          AjoChain transactions are configured for Celo Mainnet (42220). Accept the wallet prompt to switch networks and continue.
        </p>
      </section>
    );
  }

  return (
    <Suspense fallback={<HomeDashboardSkeleton />}>
      <HomeDashboardContent />
    </Suspense>
  );
}
