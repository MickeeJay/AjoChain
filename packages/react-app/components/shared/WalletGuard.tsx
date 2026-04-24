"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { useMiniPay } from "@/hooks/useMiniPay";

type WalletGuardProps = {
  children: ReactNode;
};

export function WalletGuard({ children }: WalletGuardProps) {
  const pathname = usePathname();
  const { isMiniPay, isConnected, isLoading } = useMiniPay();
  const isPublicCredentialRoute = pathname?.startsWith("/credentials/") ?? false;
  const isPublicEntryRoute = pathname === "/" || (pathname?.startsWith("/invite/") ?? false);

  if (isPublicCredentialRoute || isPublicEntryRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="mx-auto mt-6 flex w-full max-w-[360px] flex-col justify-center rounded-[1.5rem] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_20px_80px_rgba(16,42,44,0.12)] minipay:min-h-[520px]">
        <p className="text-lg font-semibold">Checking wallet status</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Preparing the wallet connection state.</p>
      </div>
    );
  }

  if (isConnected || isMiniPay) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto mt-6 flex w-full max-w-[360px] flex-col justify-center rounded-[1.5rem] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_20px_80px_rgba(16,42,44,0.12)] minipay:min-h-[520px]">
      <p className="text-lg font-semibold">Connect your wallet to continue</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Use a supported wallet connection before creating or joining a savings group.
      </p>
      <ConnectWalletButton isMiniPay={isMiniPay} fullWidth className="mt-5" />
      <Link href="/" className="mt-5 inline-flex min-h-12 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
        Back home
      </Link>
    </div>
  );
}
