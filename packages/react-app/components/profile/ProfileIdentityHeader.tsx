"use client";

import { Check, Copy } from "lucide-react";

type ProfileIdentityHeaderProps = {
  addressLabel: string;
  ensName: string | null;
  onCopyAddress: () => void;
  copied: boolean;
};

export function ProfileIdentityHeader({ addressLabel, ensName, onCopyAddress, copied }: ProfileIdentityHeaderProps) {
  return (
    <header className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_42px_rgba(16,42,44,0.1)]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-full bg-celo-green/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-celo-green">Profile</span>
        {ensName ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">{ensName}</span> : null}
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Your savings identity on Celo.</h1>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">{addressLabel}</p>
        <button
          type="button"
          onClick={onCopyAddress}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </header>
  );
}
