import Link from "next/link";
import { ContributeButton } from "@/components/groups/ContributeButton";
import { MemberList } from "@/components/groups/MemberList";
import { TransactionStatus } from "@/components/shared/TransactionStatus";

const members = [
  { name: "Mina", paid: true },
  { name: "Ayo", paid: true },
  { name: "Grace", paid: false },
];

export default function GroupDetailPage({ params }: { params: { address: string } }) {
  const paidCount = members.filter((member) => member.paid).length;

  return (
    <section className="flex flex-col gap-4 text-slate-900">
      <div className="space-y-4 rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-celo-green/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-celo-green">
            Group detail
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">{params.address}</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
            Monitor who has contributed, who is next in line, and whether the payout condition is ready to execute.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
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

        <div className="flex flex-wrap gap-3">
          <ContributeButton onClick={() => undefined} />
          <Link href="/groups" className="inline-flex min-h-12 items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
            Back to groups
          </Link>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Members</p>
          <MemberList members={members} />
        </div>
      </div>
    </section>
  );
}
