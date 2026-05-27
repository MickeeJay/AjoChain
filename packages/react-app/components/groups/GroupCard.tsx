import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { formatCusdFromWei } from "@/lib/formatters";
import type { GroupStatus } from "@/types";
import { GroupProgress } from "./GroupProgress";

type GroupCardProps = {
  groupAddress: `0x${string}`;
  name: string;
  status: GroupStatus;
  memberCount: number;
  maxMembers: number;
  contributionAmount: bigint;
  currentRound: number;
  totalRounds: number;
  memberOrder: `0x${string}`[];
  nextPayoutTo: `0x${string}`;
  needsContribution: boolean;
};

const STATUS_STYLES: Record<GroupStatus, string> = {
  FORMING: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  COMPLETED: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200",
  PAUSED: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function GroupCard({
  groupAddress,
  name,
  status,
  memberCount,
  maxMembers,
  contributionAmount,
  currentRound,
  totalRounds,
  memberOrder,
  nextPayoutTo,
  needsContribution,
}: GroupCardProps) {
  const highlightContribution = status === "ACTIVE" && needsContribution;

  return (
    <Link
      href={`/groups/${groupAddress}`}
      className={[
        "group block rounded-[1.5rem] border bg-white p-4 shadow-[0_16px_50px_rgba(16,42,44,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 dark:bg-slate-950/90 glass-card",
        highlightContribution
          ? "border-emerald-300 dark:border-emerald-400/60 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)]"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-[0_20px_50px_rgba(16,42,44,0.12)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-950 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">{name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={["rounded-full border px-2.5 py-1 font-semibold transition-colors duration-300", STATUS_STYLES[status]].join(" ")}>{status}</span>
            <span className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
              {memberCount}/{maxMembers} members
            </span>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 dark:text-slate-500" />
      </div>

      <div className="mt-3 grid grid-cols-1 minipay:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
        <p>Contribution: {formatCusdFromWei(contributionAmount)} cUSD</p>
        <p>
          Round: {Math.min(currentRound + 1, totalRounds)}/{totalRounds}
        </p>
      </div>

      <div className="mt-5">
        <GroupProgress
          currentRound={currentRound}
          totalRounds={totalRounds}
          memberOrder={memberOrder}
          nextPayoutTo={nextPayoutTo}
        />
      </div>

      {status === "FORMING" ? (
        <p className="mt-4 text-sm font-medium text-amber-700 dark:text-amber-200">
          Waiting for members ({memberCount}/{maxMembers})
        </p>
      ) : null}

      {status === "COMPLETED" ? (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          Cycle Complete
        </p>
      ) : null}

      {highlightContribution ? (
        <span className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-500 dark:text-slate-950">
          Contribute {formatCusdFromWei(contributionAmount)} cUSD
        </span>
      ) : null}
    </Link>
  );
}
