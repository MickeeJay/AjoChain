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
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(16,42,44,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Saved</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{loading ? "--" : formatCusdCurrency(totalSaved)}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(16,42,44,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Groups Completed</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{loading ? "--" : groupsCompleted}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(16,42,44,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active Groups</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{loading ? "--" : activeGroups}</p>
      </article>
    </section>
  );
}
