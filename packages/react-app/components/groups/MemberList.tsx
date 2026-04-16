type Member = {
  name: string;
  paid: boolean;
};

type MemberListProps = {
  members: Member[];
};

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <span className="font-medium text-slate-900">{member.name}</span>
          <span className={member.paid ? "text-emerald-600" : "text-amber-600"}>{member.paid ? "Paid" : "Awaiting"}</span>
        </div>
      ))}
    </div>
  );
}
