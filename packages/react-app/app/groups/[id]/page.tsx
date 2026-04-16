import Link from "next/link";
import { ContributeButton } from "@/components/groups/ContributeButton";
import { MemberList } from "@/components/groups/MemberList";
import { TransactionStatus } from "@/components/shared/TransactionStatus";

const members = [
  { name: "Mina", paid: true },
  { name: "Ayo", paid: true },
  { name: "Grace", paid: false },
];

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const paidCount = members.filter((member) => member.paid).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8 text-slate-900 lg:px-10">
      <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-[0_20px_80px_rgba(16,42,44,0.12)] backdrop-blur">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Group detail
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{params.id}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Monitor who has contributed, who is next in line, and whether the payout condition is ready to execute.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-400">Current cycle</p>
            <p className="mt-2 text-3xl font-semibold">1</p>
          </div>
          <div className="rounded-3xl bg-emerald-600 p-5 text-white">
            <p className="text-sm text-emerald-100">Contributions received</p>
            <p className="mt-2 text-3xl font-semibold">{paidCount} / {members.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-100 p-5 text-slate-900">
            <p className="text-sm text-slate-500">Next payout recipient</p>
            <p className="mt-2 text-2xl font-semibold">Mina</p>
          </div>
        </div>

        <TransactionStatus status="success" label="Payout ready when wallet approves" />

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Members</p>
          <MemberList members={members} />
        </div>

        <div className="flex flex-wrap gap-3">
          <ContributeButton onClick={() => undefined} />
          <Link href="/groups" className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Back to groups
          </Link>
        </div>
      </div>
    </main>
  );
}
