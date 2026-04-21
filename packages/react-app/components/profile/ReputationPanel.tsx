"use client";

import { ShieldCheck } from "lucide-react";
import { getReputationTierLabel } from "@/lib/profile";

type ReputationPanelProps = {
  score: bigint;
  loading?: boolean;
};

export function ReputationPanel({ score, loading = false }: ReputationPanelProps) {
  const tierLabel = getReputationTierLabel(score);

  return (
    <article className="rounded-[1.6rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-[0_18px_45px_rgba(6,95,70,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-emerald-800">Reputation Score</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-emerald-950">{loading ? "--" : score.toString()}</p>
          <p className="mt-2 text-sm font-semibold text-emerald-700">{loading ? "Evaluating..." : tierLabel}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm text-emerald-900/80">Reputation is based on completed savings cycles from your on-chain AjoChain credentials.</p>
    </article>
  );
}
