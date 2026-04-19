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
  FORMING: "border-amber-200 bg-amber-50 text-amber-700",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PAUSED: "border-slate-300 bg-slate-100 text-slate-700",
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
        "group block rounded-[1.5rem] border bg-white p-4 shadow-[0_16px_50px_rgba(16,42,44,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(16,42,44,0.12)]",
        highlightContribution ? "border-emerald-300" : "border-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-950">{name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={["rounded-full border px-2.5 py-1 font-semibold", STATUS_STYLES[status]].join(" ")}>{status}</span>
            <span className="text-slate-500">
              {memberCount}/{maxMembers} members
            </span>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:text-emerald-600" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <p>Contribution: {formatCusdFromWei(contributionAmount)} cUSD</p>
        <p>
          Round: {Math.min(currentRound, totalRounds)}/{totalRounds}
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
        <p className="mt-4 text-sm font-medium text-amber-700">Waiting for members ({memberCount}/{maxMembers})</p>
      ) : null}

      {status === "COMPLETED" ? (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Cycle Complete
        </p>
      ) : null}

      {highlightContribution ? (
        <span className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Contribute ${formatCusdFromWei(contributionAmount)}
        </span>
      ) : null}
    </Link>
  );
}
