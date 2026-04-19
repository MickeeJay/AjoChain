import { CheckCircle2 } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

type Member = {
  address: `0x${string}`;
  contributed: boolean;
};

type MemberListProps = {
  members: Member[];
};

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.address} className="flex min-h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900">
            {shortenAddress(member.address)}
          </span>
          {member.contributed ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Contributed
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-500">Pending</span>
          )}
        </div>
      ))}
    </div>
  );
}
