"use client";

import { formatCusdCurrency } from "@/lib/profile";

type ProfileStatsRowProps = {
  totalSaved: bigint;
  groupsCompleted: number;
  activeGroups: number;
  loading?: boolean;
};

export function ProfileStatsRow({ totalSaved, groupsCompleted, activeGroups, loading = false }: ProfileStatsRowProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Total Saved</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{loading ? "--" : formatCusdCurrency(totalSaved)}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Groups Completed</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{loading ? "--" : groupsCompleted}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Active Groups</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{loading ? "--" : activeGroups}</p>
      </article>
    </section>
  );
}
