"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useCUSD } from "@/hooks/useCUSD";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCountdown, formatCusdFromWei } from "@/lib/formatters";
import { shortenAddress } from "@/lib/utils";

function resolveGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function HomeDashboardContent() {
  const { address, chainId } = useAccount();
  const resolvedChainId = chainId === 44787 ? 44787 : 42220;
  const { balance } = useCUSD({ owner: address, chainId: resolvedChainId });
  const { userGroups, activeGroupCount, totalSaved, cyclesCompleted, nextActionGroup, activity, isGroupsLoading, isActivityLoading, isCyclesLoading } = useDashboardData();
  const [secondsLeft, setSecondsLeft] = useState(nextActionGroup?.remainingTime ?? 0);

  useEffect(() => {
    setSecondsLeft(nextActionGroup?.remainingTime ?? 0);
  }, [nextActionGroup?.remainingTime]);

  useEffect(() => {
    if (!nextActionGroup || secondsLeft <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [nextActionGroup, secondsLeft]);

  const greetingName = useMemo(() => shortenAddress(address), [address]);
  const greetingPrefix = useMemo(() => resolveGreeting(), []);

  return (
    <section className="space-y-4 text-slate-900">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
        <div className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(16,42,44,0.1)]">
            <p className="text-sm font-medium text-slate-500">{greetingPrefix}, {greetingName}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">cUSD {formatCusdFromWei(balance?.value)}</p>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active Groups</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{isGroupsLoading ? "--" : activeGroupCount}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Saved</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{isGroupsLoading ? "--" : formatCusdFromWei(totalSaved)}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Cycles Completed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{isCyclesLoading ? "--" : Number(cyclesCompleted)}</p>
            </article>
          </section>
        </div>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_30px_rgba(16,42,44,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Next Action</p>
          {nextActionGroup ? (
            <div className="mt-3 space-y-3">
              <p className="text-lg font-semibold text-slate-950">Contribute to {nextActionGroup.name}</p>
              <p className="text-sm text-slate-600">Round timer: {formatCountdown(secondsLeft)}</p>
              <Link
                href={`/groups/${nextActionGroup.groupAddress}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-celo-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Contribute {formatCusdFromWei(nextActionGroup.contributionAmount)} cUSD
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-slate-600">You are not in an active group yet.</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/create"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-celo-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Start or Join a Group
                </Link>
                <Link
                  href="/groups"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
                >
                  Browse Groups
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_30px_rgba(16,42,44,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Recent Activity</p>
        <div className="mt-4 space-y-2">
          {isActivityLoading ? (
            <p className="text-sm text-slate-600">Loading recent activity...</p>
          ) : activity.length > 0 ? (
            activity.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">
                  {item.groupName} • {new Date(item.timestamp * 1000).toLocaleString()}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-600">No transaction events yet for your groups.</p>
          )}
        </div>
      </section>

      {userGroups.length === 0 ? null : (
        <p className="text-center text-xs text-slate-500">Your groups are synced from on-chain factory and group state reads.</p>
      )}
    </section>
  );
}
