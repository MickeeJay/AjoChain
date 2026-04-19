"use client";

import { Suspense } from "react";
import { HomeDashboardContent } from "@/components/home/HomeDashboardContent";
import { HomeDashboardSkeleton } from "@/components/home/HomeDashboardSkeleton";
import { HomeLanding } from "@/components/home/HomeLanding";
import { useMiniPay } from "@/hooks/useMiniPay";

export default function HomePage() {
  const { isMiniPay, isReady, isConnected } = useMiniPay();

  if (!isReady) {
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

  return (
    <Suspense fallback={<HomeDashboardSkeleton />}>
      <HomeDashboardContent />
    </Suspense>
  );
}
