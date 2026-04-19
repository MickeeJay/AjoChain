import { Crown } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { GroupStatusBadge } from "./GroupStatusBadge";

type GroupDetailHeaderProps = {
  name: string;
  status: "FORMING" | "ACTIVE" | "COMPLETED" | "PAUSED";
  creator: `0x${string}`;
  isCreator: boolean;
};

export function GroupDetailHeader({ name, status, creator, isCreator }: GroupDetailHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <GroupStatusBadge status={status} />
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          <Crown className="h-3.5 w-3.5" />
          Creator {isCreator ? "(you)" : shortenAddress(creator)}
        </span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{name}</h1>
    </div>
  );
}
