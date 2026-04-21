import Link from "next/link";

export default function CredentialNotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-120px)] w-full max-w-2xl flex-col items-center justify-center px-4 py-8 text-center text-slate-900">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(16,42,44,0.1)]">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Credential</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Certificate not found</h1>
        <p className="mt-3 text-sm text-slate-600">This credential token is unavailable on the configured Celo networks.</p>
        <Link
          href="/profile"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-celo-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Back to profile
        </Link>
      </div>
    </main>
  );
}
