import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GroupProgress } from "./GroupProgress";

type GroupCardProps = {
  id: string;
  name: string;
  status: string;
  current: number;
  total: number;
  nextPayout: string;
};

export function GroupCard({ id, name, status, current, total, nextPayout }: GroupCardProps) {
  return (
    <Link
      href={`/groups/${id}`}
      className="group rounded-[1.5rem] border border-white/60 bg-white/85 p-5 shadow-[0_16px_50px_rgba(16,42,44,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(16,42,44,0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-950">{name}</p>
          <p className="mt-1 text-sm text-slate-500">{status}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:text-emerald-600" />
      </div>
      <div className="mt-5">
        <GroupProgress current={current} total={total} />
      </div>
      <p className="mt-4 text-sm text-slate-600">Next payout: {nextPayout}</p>
    </Link>
  );
}
