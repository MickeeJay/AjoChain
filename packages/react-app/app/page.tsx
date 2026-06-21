"use client";

import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { HomeDashboardSkeleton } from "@/components/home/HomeDashboardSkeleton";
import { HomeLanding } from "@/components/home/HomeLanding";
import { AuthErrorBanner } from "@/components/shared/AuthErrorBanner";
import { AuthStatusPill } from "@/components/shared/AuthStatusPill";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { SocialLoginGroup } from "@/components/shared/SocialLoginGroup";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useMiniPay } from "@/hooks/useMiniPay";

const HomeDashboardContent = lazy(() => import("@/components/home/HomeDashboardContent").then((module) => ({ default: module.HomeDashboardContent })));

export default function HomePage() {
  const { isMiniPay, isLoading, isConnected, chainId, isWrongNetwork, switchToCeloMainnet, error, isConnecting } = useMiniPay();
  const { status, isSignedIn, userLabel, userImage } = useAuthStatus();

  if (isLoading) {
    return <HomeDashboardSkeleton />;
  }

  if (!isConnected && !isMiniPay && !isSignedIn) {
    return <HomeLanding isMiniPay={isMiniPay} />;
  }

  if (isSignedIn && !isConnected && !isMiniPay) {
    return (
      <div className="mx-auto mt-6 flex w-full max-w-[360px] flex-col justify-center rounded-[1.5rem] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_20px_80px_rgba(16,42,44,0.12)] minipay:min-h-[520px] dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100 animate-pulse">
        <div className="flex flex-col items-center text-center p-4">
          <Loader2 className="h-10 w-10 animate-spin text-celo-green" />
          <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Setting up your wallet...</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            AjoChain is securing your decentralized wallet. This only takes a moment.
          </p>
        </div>
      </div>
    );
  }

  if (!isConnected && isMiniPay) {
    return (
      <section className="rounded-[1.25rem] sm:rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5 text-slate-900 shadow-[0_16px_40px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100">
        <p className="text-lg font-semibold">MiniPay wallet detected</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Tap below to connect your MiniPay account. This lets AjoChain show your balance and savings groups.
        </p>
        <AuthErrorBanner className="mt-3" />
        {status !== "loading" && isSignedIn ? (
          <AuthStatusPill className="mt-4" userLabel={userLabel} userImage={userImage} />
        ) : (
          <SocialLoginGroup className="mt-4" />
        )}
        <ConnectWalletButton isMiniPay fullWidth className="mt-4" />
        {error ? (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  if (isMiniPay && isConnected && isWrongNetwork && chainId !== undefined) {
    return (
      <section className="rounded-[1.25rem] sm:rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 sm:p-5 text-amber-900 shadow-[0_16px_40px_rgba(146,64,14,0.08)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <p className="text-lg font-semibold">Switch to Celo Mainnet</p>
        <p className="mt-2 text-sm leading-6">
          AjoChain runs on the Celo network. Tap the button below and accept the prompt in your wallet to switch to the correct network.
        </p>
        <button
          type="button"
          onClick={() => void switchToCeloMainnet()}
          disabled={isConnecting}
          className="mt-5 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-full bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
        >
          {isConnecting ? "Switching network" : "Switch to Celo Mainnet"}
        </button>
        {error ? (
          <p className="mt-3 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-slate-950 dark:text-amber-100">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <Suspense fallback={<HomeDashboardSkeleton />}>
      <HomeDashboardContent />
    </Suspense>
  );
}
