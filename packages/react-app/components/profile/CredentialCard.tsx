"use client";

import { CheckCircle2, Share2 } from "lucide-react";
import { formatCredentialCompletionDate, formatCusdCurrency } from "@/lib/profile";
import type { UserCredential } from "@/types";

type CredentialCardProps = {
  credential: UserCredential;
  onShare: (tokenId: bigint) => void;
  isSharing: boolean;
};

export function CredentialCard({ credential, onShare, isSharing }: CredentialCardProps) {
  return (
    <article className="relative overflow-hidden rounded-[1.6rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 p-5 shadow-[0_18px_40px_rgba(6,95,70,0.16)]">
      <div className="pointer-events-none absolute right-[-44px] top-[-44px] h-40 w-40 rounded-full bg-emerald-300/35" />
      <div className="pointer-events-none absolute bottom-[-60px] left-[-40px] h-48 w-48 rounded-full border border-emerald-300/60" />

      <div className="relative flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white">A</span>
          AjoChain
        </div>
        <CheckCircle2 className="h-5 w-5 text-emerald-700" />
      </div>

      <div className="relative mt-4 space-y-3 text-emerald-950">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-800/80">Savings Certificate</p>
          <p className="mt-1 text-xl font-semibold leading-tight">{credential.groupName || "Savings Group"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-emerald-600/15 bg-white/70 p-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-800/80">Cycles</p>
            <p className="mt-1 text-lg font-semibold">{credential.cyclesCompleted.toString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-800/80">Total Saved</p>
            <p className="mt-1 text-lg font-semibold">{formatCusdCurrency(credential.totalSaved)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-800/80">Completion Date</p>
            <p className="mt-1 text-sm font-medium">{formatCredentialCompletionDate(credential.completedAt)}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onShare(credential.tokenId)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-700 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <Share2 className="h-4 w-4" />
          {isSharing ? "Link copied" : "Share"}
        </button>
      </div>
    </article>
  );
}
