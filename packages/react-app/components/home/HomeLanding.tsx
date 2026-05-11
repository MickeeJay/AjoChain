"use client";

import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { AuthStatusPill } from "@/components/shared/AuthStatusPill";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";
import { useAuthStatus } from "@/hooks/useAuthStatus";

type HomeLandingProps = {
  isMiniPay: boolean;
};

export function HomeLanding({ isMiniPay }: HomeLandingProps) {
  const { status, isSignedIn, userLabel, userImage } = useAuthStatus();

  return (
    <section className="space-y-4 text-slate-900">
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-lime-50 to-white p-6 shadow-[0_20px_60px_rgba(7,149,95,0.14)]">
        <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-emerald-200/50 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-lime-200/40 blur-2xl" aria-hidden="true" />

        <div className="relative space-y-5">
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1">Celo</span>
            <span className="rounded-full border border-lime-300 bg-lime-100 px-3 py-1">MiniPay</span>
          </div>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950">
            Africa&apos;s Savings Tradition, Now Unstealable
          </h1>

          <p className="max-w-[30ch] text-sm leading-6 text-slate-600">
            Rotating savings groups secured by transparent smart contracts, with cUSD contributions and predictable payouts.
          </p>

          <div className="grid gap-3 sm:max-w-[280px]">
            {status !== "loading" && isSignedIn ? (
              <AuthStatusPill className="border-emerald-200 bg-white/80" userLabel={userLabel} userImage={userImage} />
            ) : (
              <GoogleSignInButton fullWidth />
            )}
            <ConnectWalletButton isMiniPay={isMiniPay} fullWidth />
            <p className="text-xs text-slate-500">Wallet required to create, join, and contribute.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
