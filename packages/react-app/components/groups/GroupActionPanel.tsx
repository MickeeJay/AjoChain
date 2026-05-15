import Link from "next/link";
import type { Address, Hash } from "viem";
import type { ContributionFlowStep } from "@/hooks/useAjoGroup";
import { ContributeButton } from "./ContributeButton";
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
  allowance: bigint;
  contributionAmount: bigint;
  isStarting: boolean;
  isContributing: boolean;
  contributionFlowStep: ContributionFlowStep;
  approveTxHash?: Hash;
  contributeTxHash?: Hash;
  lastPayoutRecipient?: Address | null;
  onStartGroup: () => void;
  onContribute: () => void;
  canDownloadCertificate: boolean;
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
  allowance,
  contributionAmount,
  isStarting,
  isContributing,
  contributionFlowStep,
  approveTxHash,
  contributeTxHash,
  lastPayoutRecipient,
  onStartGroup,
  onContribute,
  canDownloadCertificate,
  certificateHref,
}: GroupActionPanelProps) {
  if (status === "FORMING" && isCreator) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/90">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Minimum {requiredMembers} members required before start.
        </p>
        <button
          type="button"
          disabled={!minMembersMet || isStarting}
          onClick={onStartGroup}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-celo-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300 dark:disabled:bg-slate-700"
        >
          {isStarting ? "Starting group..." : "Start Group"}
        </button>
        {!minMembersMet ? (
          <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
            Waiting for members ({memberCount}/{requiredMembers})
          </p>
        ) : null}
      </div>
    );
  }

  if (status === "FORMING" && isMember) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        Waiting to start...
      </div>
    );
  }

  if (status === "ACTIVE" && isMember && !hasContributedThisRound) {
    return (
      <ContributeButton
        allowance={allowance}
        contributionAmount={contributionAmount}
        disabled={false}
        isContributing={isContributing}
        flowStep={contributionFlowStep}
        approveTxHash={approveTxHash}
        contributeTxHash={contributeTxHash}
        lastPayoutRecipient={lastPayoutRecipient}
        onClick={onContribute}
      />
    );
  }

  if (status === "ACTIVE" && isMember && hasContributedThisRound) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        Contributed ✓ Waiting for others
      </div>
    );
  }

  if (status === "ACTIVE" && !isMember) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        Group is active. Join from the invite flow to contribute.
      </div>
    );
  }

  if (status === "COMPLETED") {
    if (!canDownloadCertificate) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          Group completed. Certificate is available to participating members.
        </div>
      );
    }

    return (
      <Link
        href={certificateHref}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-celo-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
      >
        Download Certificate
      </Link>
    );
  }

  if (status === "PAUSED") {
    return (
      <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        Round is paused by group governance.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      No action required.
    </div>
  );
}
