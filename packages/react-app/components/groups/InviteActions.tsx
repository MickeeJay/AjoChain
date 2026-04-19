"use client";

import { useMemo, useState } from "react";

type InviteActionsProps = {
  inviteCode: `0x${string}`;
};

function resolveAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.length > 0) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://ajochain.app";
}

export function InviteActions({ inviteCode }: InviteActionsProps) {
  const [copied, setCopied] = useState(false);

  const inviteLink = useMemo(() => {
    const appUrl = resolveAppUrl().replace(/\/$/, "");
    return `${appUrl}/invite/${inviteCode}`;
  }, [inviteCode]);

  const whatsappShareLink = useMemo(() => {
    return `https://wa.me/?text=Join%20my%20AjoChain%20savings%20group%3A%20${encodeURIComponent(inviteLink)}`;
  }, [inviteLink]);

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Invite members</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyInviteLink()}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
        >
          {copied ? "Invite link copied" : "Copy invite link"}
        </button>
        <a
          href={whatsappShareLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Share via WhatsApp
        </a>
      </div>
    </div>
  );
}
