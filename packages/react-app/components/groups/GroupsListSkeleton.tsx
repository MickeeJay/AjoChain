export function GroupsListSkeleton() {
  return (
    <section className="grid animate-pulse gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <article key={item} className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
          <div className="h-5 w-36 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
          <div className="mt-4 h-16 rounded bg-slate-200" />
          <div className="mt-4 h-10 w-36 rounded-full bg-slate-200" />
        </article>
      ))}
    </section>
  );
}
