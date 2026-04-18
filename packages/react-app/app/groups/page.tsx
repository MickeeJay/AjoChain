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
    <section className="flex flex-col gap-4 text-slate-900">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-celo-green/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-celo-green">
          My groups
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Your rotating savings circles.</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
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
    </section>
  );
}
