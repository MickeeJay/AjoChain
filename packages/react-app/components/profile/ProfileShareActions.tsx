"use client";

import { Check, Link2, MessageCircleMore } from "lucide-react";

type ProfileShareActionsProps = {
  onCopyProfile: () => void;
  copiedProfile: boolean;
  whatsappHref: string;
};

export function ProfileShareActions({ onCopyProfile, copiedProfile, whatsappHref }: ProfileShareActionsProps) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Share</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onCopyProfile}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-500"
        >
          {copiedProfile ? <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> : <Link2 className="h-4 w-4" />}
          {copiedProfile ? "Profile link copied" : "Share my savings record"}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
        >
          <MessageCircleMore className="h-4 w-4" />
          Share on WhatsApp
        </a>
      </div>
    </section>
  );
}
