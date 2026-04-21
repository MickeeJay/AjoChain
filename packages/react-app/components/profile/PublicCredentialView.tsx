import { BadgeCheck } from "lucide-react";
import { formatCredentialCompletionDate, formatCusdCurrency } from "@/lib/profile";
import type { PublicCredentialPayload } from "@/lib/contracts/publicCredential";

type PublicCredentialViewProps = {
  credential: PublicCredentialPayload;
  verifyUrl: string;
};

export function PublicCredentialView({ credential, verifyUrl }: PublicCredentialViewProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-120px)] w-full max-w-3xl flex-col justify-center px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-300 bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 p-6 shadow-[0_24px_80px_rgba(6,95,70,0.2)] sm:p-8">
        <div className="pointer-events-none absolute left-[-60px] top-[-40px] h-56 w-56 rounded-full bg-emerald-300/35" />
        <div className="pointer-events-none absolute bottom-[-120px] right-[-70px] h-64 w-64 rounded-full border border-emerald-400/35" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">AjoChain</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-emerald-950 sm:text-4xl">Savings Certificate</h1>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white">
            <BadgeCheck className="h-6 w-6" />
          </span>
        </div>

        <div className="relative mt-6 grid gap-4 rounded-3xl border border-emerald-700/15 bg-white/80 p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-800/80">Name</p>
            <p className="mt-1 text-lg font-semibold text-emerald-950">{credential.metadata.name || "AjoChain Savings Certificate"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-800/80">Group</p>
            <p className="mt-1 text-lg font-semibold text-emerald-950">{credential.groupName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-800/80">Cycles Completed</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-950">{credential.cyclesCompleted.toString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-800/80">Total Saved</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-950">{formatCusdCurrency(credential.totalSaved)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-800/80">Completion Date</p>
            <p className="mt-1 text-base font-medium text-emerald-950">{formatCredentialCompletionDate(credential.completedAt)}</p>
          </div>
        </div>

        <a
          href={verifyUrl}
          target="_blank"
          rel="noreferrer"
          className="relative mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Verify on Celo
        </a>
      </section>
    </main>
  );
}
