import Link from "next/link";
import type { GroupStatus } from "@/types";

type GroupActionPanelProps = {
  status: GroupStatus;
  isCreator: boolean;
  isMember: boolean;
  minMembersMet: boolean;
  memberCount: number;
  requiredMembers: number;
  hasContributedThisRound: boolean;
  contributionLabel: string;
  isStarting: boolean;
  isContributing: boolean;
  onStartGroup: () => void;
  onContribute: () => void;
  certificateHref: string;
};

export function GroupActionPanel({
  status,
  isCreator,
  isMember,
  minMembersMet,
  memberCount,
  requiredMembers,
  hasContributedThisRound,
  contributionLabel,
  isStarting,
  isContributing,
  onStartGroup,
  onContribute,
  certificateHref,
}: GroupActionPanelProps) {
  if (status === "FORMING" && isCreator) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-600">Minimum {requiredMembers} members required before start.</p>
        <button
          type="button"
          disabled={!minMembersMet || isStarting}
          onClick={onStartGroup}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-celo-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isStarting ? "Starting group..." : "Start Group"}
        </button>
        {!minMembersMet ? <p className="mt-2 text-xs font-medium text-amber-700">Waiting for members ({memberCount}/{requiredMembers})</p> : null}
      </div>
    );
  }

  if (status === "FORMING" && isMember) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
        Waiting to start...
      </div>
    );
  }

  if (status === "ACTIVE" && isMember && !hasContributedThisRound) {
    return (
      <button
        type="button"
        onClick={onContribute}
        disabled={isContributing}
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {isContributing ? "Submitting contribution..." : `Contribute ${contributionLabel}`}
      </button>
    );
  }

  if (status === "ACTIVE" && isMember && hasContributedThisRound) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        Contributed ✓ Waiting for others
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <Link
        href={certificateHref}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-celo-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Download Certificate
      </Link>
    );
  }

  if (status === "PAUSED") {
    return (
      <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
        Round is paused by group governance.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      No action required.
    </div>
  );
}
