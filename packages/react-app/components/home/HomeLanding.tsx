"use client";

import { Wallet } from "lucide-react";
import { useMemo } from "react";
import { useConnect } from "wagmi";

type HomeLandingProps = {
  isMiniPay: boolean;
};

export function HomeLanding({ isMiniPay }: HomeLandingProps) {
  const { connect, connectors, isPending } = useConnect();

  const primaryConnector = useMemo(() => connectors.find((connector) => connector.id === "injected") ?? connectors[0], [connectors]);

  const handleConnect = () => {
    if (!primaryConnector) {
      return;
    }

    connect({ connector: primaryConnector });
  };

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

          <button
            type="button"
            onClick={handleConnect}
            disabled={!primaryConnector || isPending}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Wallet className="h-4 w-4" />
            {isMiniPay ? "Open MiniPay" : isPending ? "Connecting wallet" : "Connect wallet"}
          </button>
        </div>
      </div>
    </section>
  );
}
