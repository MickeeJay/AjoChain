"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthErrorBanner } from "@/components/shared/AuthErrorBanner";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { SocialLoginGroup } from "@/components/shared/SocialLoginGroup";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useMiniPay } from "@/hooks/useMiniPay";

type WalletGuardProps = {
  children: ReactNode;
};

export function WalletGuard({ children }: WalletGuardProps) {
  const pathname = usePathname();
  const { isMiniPay, isConnected, isLoading } = useMiniPay();
  const { status, isSignedIn } = useAuthStatus();
  const isAuthLoading = status === "loading";
  const isPublicCredentialRoute = pathname?.startsWith("/credentials/") ?? false;
  const isPublicEntryRoute = pathname === "/" || (pathname?.startsWith("/invite/") ?? false);
  const isPublicPreviewRoute =
    pathname?.startsWith("/groups") ||
    pathname?.startsWith("/create") ||
    pathname?.startsWith("/profile") ||
    false;

  if (isPublicCredentialRoute || isPublicEntryRoute || isPublicPreviewRoute) {
    return <>{children}</>;
  }

  if (isLoading || isAuthLoading) {
    return (
      <div className="mx-auto mt-6 flex w-full max-w-[360px] flex-col justify-center rounded-[1.5rem] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_20px_80px_rgba(16,42,44,0.12)] minipay:min-h-[520px] dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100">
        <p className="text-lg font-semibold">Checking access</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Preparing your sign-in and wallet status.</p>
      </div>
    );
  }

  if (isConnected || isMiniPay || isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto mt-6 flex w-full max-w-[360px] flex-col justify-center rounded-[1.5rem] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_20px_80px_rgba(16,42,44,0.12)] minipay:min-h-[520px] dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Welcome to AjoChain</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Sign in to participate in secure, decentralized group savings.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
        No wallet? No problem! Sign in with your email and we'll automatically create a secure savings wallet for you.
      </p>
      <AuthErrorBanner className="mt-3" />
      <div className="mt-5 space-y-3">
        <SocialLoginGroup />
        <ConnectWalletButton isMiniPay={isMiniPay} fullWidth />
      </div>
      <Link
        href="/"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
      >
        Back home
      </Link>
    </div>
  );
}

