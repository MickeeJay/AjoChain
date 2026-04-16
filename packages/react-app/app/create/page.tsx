import Link from "next/link";
import { CalendarDays, CircleDollarSign, Users } from "lucide-react";
import { CreateGroupForm } from "@/components/create/CreateGroupForm";
import { TransactionStatus } from "@/components/shared/TransactionStatus";

export default function CreateGroupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8 text-slate-900 lg:px-10">
      <div className="grid gap-8 rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-[0_20px_80px_rgba(16,42,44,0.12)] backdrop-blur lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Create group
          </span>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Set up a savings circle in minutes.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              The factory contract deploys a new rotating savings group while the frontend keeps the setup simple for mobile users.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <CircleDollarSign className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Contribution</p>
              <p className="mt-2 text-sm text-slate-600">Define a cUSD amount everyone contributes each cycle.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <Users className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Members</p>
              <p className="mt-2 text-sm text-slate-600">Invite the exact people who should be in the savings circle.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Cycle</p>
              <p className="mt-2 text-sm text-slate-600">Set how long each savings round should last.</p>
            </article>
          </div>
        </section>

        <aside className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
          <TransactionStatus status="pending" label="Drafting new group" />
          <div className="mt-5">
            <CreateGroupForm />
          </div>
          <Link href="/groups" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-50">
            Review groups
          </Link>
        </aside>
      </div>
    </main>
  );
}
