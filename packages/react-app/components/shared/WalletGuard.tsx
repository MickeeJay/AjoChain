"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthErrorBanner } from "@/components/shared/AuthErrorBanner";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";
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

  if (isPublicCredentialRoute || isPublicEntryRoute) {
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
      <p className="text-lg font-semibold">Sign in or connect your wallet</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        Use Google to explore groups and profiles. A wallet is required for creating, joining, and contributing.
      </p>
      <AuthErrorBanner className="mt-3" />
      <div className="mt-5 grid gap-3">
        <GoogleSignInButton fullWidth />
        <ConnectWalletButton isMiniPay={isMiniPay} fullWidth />
      </div>
      <Link
        href="/"
        className="mt-5 inline-flex min-h-12 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
      >
        Back home
      </Link>
    </div>
  );
}
