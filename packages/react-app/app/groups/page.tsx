import { GroupCard } from "@/components/groups/GroupCard";

const groups = [
  {
    id: "circle-001",
    name: "Market Traders Circle",
    status: "Active",
    nextPayout: "Today",
  },
  {
    id: "circle-002",
    name: "Diaspora Family Fund",
    status: "Contributing",
    nextPayout: "2 days",
  },
];

export default function GroupsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8 text-slate-900 lg:px-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
            My groups
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Your rotating savings circles.</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Check the contribution status, payout order, and completion progress of each savings group connected to your wallet.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              status={group.status}
              current={group.status === "Active" ? 2 : 1}
              total={group.id === "circle-001" ? 5 : 4}
              nextPayout={group.nextPayout}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
