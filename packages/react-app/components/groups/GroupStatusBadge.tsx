import type { GroupStatus } from "@/types";

type GroupStatusBadgeProps = {
  status: GroupStatus;
};

const STATUS_STYLES: Record<GroupStatus, string> = {
  FORMING: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  COMPLETED: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200",
  PAUSED: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function GroupStatusBadge({ status }: GroupStatusBadgeProps) {
  return <span className={["inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]", STATUS_STYLES[status]].join(" ")}>{status}</span>;
}
