import Link from "next/link";

export function GroupsEmptyState() {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-emerald-300 bg-emerald-50/60 p-6 text-center">
      <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-white shadow-sm" aria-hidden="true">
        <svg viewBox="0 0 64 64" className="h-10 w-10 text-emerald-600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="20" r="10" stroke="currentColor" strokeWidth="3" />
          <path d="M12 54c3-10 11-16 20-16s17 6 20 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-950">No groups yet</h2>
      <p className="mt-2 text-sm text-slate-600">Create your first savings group and start building a secure contribution cycle on Celo.</p>
      <Link
        href="/create"
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-celo-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Create your first savings group
      </Link>
    </section>
  );
}
