"use client";

import { CredentialCard } from "@/components/profile/CredentialCard";
import type { UserCredential } from "@/types";

type CredentialsSectionProps = {
  credentials: UserCredential[];
  isLoading: boolean;
  sharingTokenId: bigint | null;
  onShare: (tokenId: bigint) => void;
};

export function CredentialsSection({ credentials, isLoading, sharingTokenId, onShare }: CredentialsSectionProps) {
  return (
    <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(16,42,44,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950">Credentials</h2>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">{isLoading ? "..." : credentials.length} Certificates</span>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-600">Loading credentials...</p>
      ) : credentials.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Complete a savings cycle to earn your first certificate
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {credentials.map((credential) => (
            <CredentialCard
              key={credential.tokenId.toString()}
              credential={credential}
              onShare={onShare}
              isSharing={sharingTokenId === credential.tokenId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
