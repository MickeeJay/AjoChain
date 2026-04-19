export function HomeDashboardSkeleton() {
  return (
    <section className="animate-pulse space-y-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <div className="h-4 w-36 rounded bg-slate-200" />
        <div className="mt-3 h-10 w-44 rounded bg-slate-200" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-14 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-3 h-6 w-56 rounded bg-slate-200" />
        <div className="mt-4 h-11 w-40 rounded-full bg-slate-200" />
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-12 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    </section>
  );
}
