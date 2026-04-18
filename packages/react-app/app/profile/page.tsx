"use client";

import Link from "next/link";
import { CircleDollarSign, Globe, UserRound } from "lucide-react";
import { useAccount } from "wagmi";
import { useCUSD } from "@/hooks/useCUSD";
import { useMiniPay } from "@/hooks/useMiniPay";
import { formatCusdAmount } from "@/lib/formatters";
import { shortenAddress } from "@/lib/utils";

export default function ProfilePage() {
  const { address, chainId } = useAccount();
  const { isMiniPay, isConnected } = useMiniPay();
  const resolvedChainId = chainId === 44787 ? 44787 : 42220;
  const { balance } = useCUSD({ owner: address, chainId: resolvedChainId });

  const networkLabel = resolvedChainId === 44787 ? "Celo testnet" : "Celo mainnet";
  const balanceLabel = balance ? `cUSD ${formatCusdAmount(balance.formatted)}` : "cUSD --";

  return (
    <section className="flex flex-col gap-4 text-slate-900">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-celo-green/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-celo-green">
          Profile
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Wallet and app preferences.</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
          Check the network, cUSD balance, and MiniPay connection state tied to this device.
        </p>
      </div>

      <div className="grid gap-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(16,42,44,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Connection</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{isMiniPay ? (isConnected ? "MiniPay connected" : "MiniPay connecting") : "Regular wallet"}</p>
            </div>
            <UserRound className="h-5 w-5 text-celo-green" />
          </div>
          <p className="mt-4 text-sm text-slate-600">{address ? shortenAddress(address) : "No wallet address yet"}</p>
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(16,42,44,0.08)]">
            <Globe className="h-5 w-5 text-celo-gold" />
            <p className="mt-3 text-sm font-medium text-slate-500">Network</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{networkLabel}</p>
          </article>

          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(16,42,44,0.08)]">
            <CircleDollarSign className="h-5 w-5 text-celo-green" />
            <p className="mt-3 text-sm font-medium text-slate-500">cUSD balance</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{balanceLabel}</p>
          </article>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/create" className="inline-flex min-h-12 items-center justify-center rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Create a group
          </Link>
          <Link href="/groups" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            View groups
          </Link>
        </div>
      </div>
    </section>
  );
}