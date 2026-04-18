"use client";

import { useState } from "react";

type CreateGroupFormProps = {
  onSubmit?: (value: {
    name: string;
    contributionAmount: string;
    members: string;
    cycleDuration: string;
  }) => void;
};

export function CreateGroupForm({ onSubmit }: CreateGroupFormProps) {
  const [name, setName] = useState("Market Traders Circle");
  const [contributionAmount, setContributionAmount] = useState("10");
  const [members, setMembers] = useState("5");
  const [cycleDuration, setCycleDuration] = useState("604800");

  return (
    <form
      className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_50px_rgba(16,42,44,0.08)]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.({ name, contributionAmount, members, cycleDuration });
      }}
    >
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Group name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-celo-green"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Contribution amount (cUSD)
        <input
          value={contributionAmount}
          onChange={(event) => setContributionAmount(event.target.value)}
          className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-celo-green"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Members
        <input
          value={members}
          onChange={(event) => setMembers(event.target.value)}
          className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-celo-green"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Cycle duration (seconds)
        <input
          value={cycleDuration}
          onChange={(event) => setCycleDuration(event.target.value)}
          className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-celo-green"
        />
      </label>
      <button type="submit" className="mt-1 inline-flex min-h-12 justify-center rounded-full bg-celo-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        Create group
      </button>
    </form>
  );
}
