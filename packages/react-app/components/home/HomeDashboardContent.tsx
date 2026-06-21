"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PiggyBank, Trophy, Users } from "lucide-react";
import { useAccount } from "wagmi";
import { useCUSD } from "@/hooks/useCUSD";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuthStatus } from "@/hooks/useAuthStatus";
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
    if (!nextActionGroup) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [nextActionGroup]);

  const { userLabel } = useAuthStatus();
  const greetingName = userLabel;
  const greetingPrefix = resolveGreeting();

  return (
    <section className="space-y-4 text-slate-900 dark:text-slate-100">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(16,42,44,0.1)] dark:border-slate-800 dark:bg-slate-950/90">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{greetingPrefix}, {greetingName}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-slate-100">
              cUSD {formatCusdFromWei(balance?.value)}
            </p>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-emerald-50/40 p-4 dark:border-slate-800 dark:from-slate-950 dark:to-emerald-900/30">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <Users className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-200" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Active Groups</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
                {isGroupsLoading ? "--" : activeGroupCount}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-lime-50/40 p-4 dark:border-slate-800 dark:from-slate-950 dark:to-lime-900/30">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-500/20">
                  <PiggyBank className="h-3.5 w-3.5 text-lime-700 dark:text-lime-200" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Total Saved</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
                {isGroupsLoading ? "--" : `${formatCusdFromWei(totalSaved)} cUSD`}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-amber-50/40 p-4 dark:border-slate-800 dark:from-slate-950 dark:to-amber-900/30">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <Trophy className="h-3.5 w-3.5 text-amber-700 dark:text-amber-200" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Cycles Completed</p>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
                {isCyclesLoading ? "--" : Number(cyclesCompleted)}
              </p>
            </article>
          </section>
        </div>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_30px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Next Action</p>
          {nextActionGroup ? (
            <div className="mt-3 space-y-3">
              <p className="text-lg font-semibold text-slate-950 dark:text-slate-100">Contribute to {nextActionGroup.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Round timer: {formatCountdown(secondsLeft)}</p>
              <Link
                href={`/groups/${nextActionGroup.groupAddress}`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-celo-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
              >
                Contribute {formatCusdFromWei(nextActionGroup.contributionAmount)} cUSD
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">You haven&apos;t joined a savings group yet.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/create"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-celo-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                >
                  Start Saving
                </Link>
                <Link
                  href="/groups"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 sm:w-auto"
                >
                  Find a Group
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_30px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Recent Activity</p>
        <div className="mt-4 space-y-2">
          {isActivityLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading recent activity...</p>
          ) : activity.length > 0 ? (
            activity.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {item.groupName} • {new Date(item.timestamp * 1000).toLocaleString()}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">No activity yet — join a group to get started.</p>
          )}
        </div>
      </section>

      {userGroups.length === 0 ? null : (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Group data is verified directly from the blockchain.
        </p>
      )}
    </section>
  );
}
