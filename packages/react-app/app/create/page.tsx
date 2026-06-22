import Link from "next/link";
import { CalendarDays, CircleDollarSign, Users } from "lucide-react";
import { CreateGroupForm } from "@/components/create/CreateGroupForm";
import { NetworkMismatchNotice } from "@/components/shared/NetworkMismatchNotice";

type CreateGroupPageProps = {
  searchParams?: {
    template?: string;
  };
};

export default function CreateGroupPage({ searchParams }: CreateGroupPageProps) {
  const template = typeof searchParams?.template === "string" ? searchParams.template : undefined;

  return (
    <section className="flex flex-col gap-4 text-slate-900 dark:text-slate-100">
      <NetworkMismatchNotice />
      <div className="grid gap-5 rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-[0_20px_80px_rgba(16,42,44,0.12)] lg:grid-cols-[1.15fr_0.85fr] dark:border-slate-800/80 dark:bg-slate-950/90">
        <section className="space-y-5">
          <span className="inline-flex rounded-full bg-celo-green/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-celo-green">
            Create group
          </span>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-slate-100">
              Start a new savings group.
            </h1>
            <p className="hidden max-w-2xl text-sm leading-6 text-slate-600 md:block md:text-base md:leading-7 dark:text-slate-400">
              Set your contribution amount, choose how often people pay, and invite your members. Setup is quick and fully automatic.
            </p>
          </div>

          <div className="hidden gap-4 xl:grid xl:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <CircleDollarSign className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Contribution</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Define a cUSD amount everyone contributes each cycle.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <Users className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Members</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Invite the exact people who should be in the savings circle.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Cycle</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Set how long each savings round should last.</p>
            </article>
          </div>
        </section>

        <aside className="rounded-[1.5rem] bg-slate-950 p-3 minipay:p-4 sm:p-5 text-white dark:bg-slate-900">
          <CreateGroupForm template={template} />
          <Link
            href="/groups"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Review groups
          </Link>
        </aside>
      </div>
    </section>
  );
}
