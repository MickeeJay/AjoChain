import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { InviteJoinActions } from "@/components/invite/InviteJoinActions";
import { formatCusdFromWei } from "@/lib/formatters";
import { formatFrequencyLabel, getInviteGroupInfo, normalizeInviteCode } from "@/lib/contracts/invite";

export const revalidate = 120;

const getCachedInviteGroupInfo = unstable_cache(
  async (inviteCode: string) => getInviteGroupInfo(inviteCode),
  ["invite-group-data"],
  { revalidate },
);

type InviteLandingPageProps = {
  params: {
    code: string;
  };
};

export async function generateMetadata({ params }: InviteLandingPageProps): Promise<Metadata> {
  const normalizedInviteCode = normalizeInviteCode(params.code);
  const inviteGroup = normalizedInviteCode ? await getCachedInviteGroupInfo(normalizedInviteCode) : null;

  const title = inviteGroup ? `Join ${inviteGroup.name} on AjoChain` : "Join an AjoChain savings group";
  const description = inviteGroup
    ? `${inviteGroup.name}: contribute $${formatCusdFromWei(inviteGroup.contributionAmount)} ${formatFrequencyLabel(inviteGroup.frequencyInDays).toLowerCase()} on MiniPay.`
    : "Open this invite on MiniPay to join a rotating savings group on AjoChain.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function InviteLandingPage({ params }: InviteLandingPageProps) {
  const normalizedInviteCode = normalizeInviteCode(params.code);
  const inviteGroup = normalizedInviteCode ? await getCachedInviteGroupInfo(normalizedInviteCode) : null;

  if (!inviteGroup) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 text-slate-900">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
          <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Invite not found</span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">This invite link is invalid or expired.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
            Ask your group organizer to share a new invite link, then open it in MiniPay to join the savings circle.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.opera.minipay"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-celo-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Download MiniPay
            </a>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
              Back home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const contributionLabel = `$${formatCusdFromWei(inviteGroup.contributionAmount)}`;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 text-slate-900">
      <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-white via-emerald-50/70 to-cyan-50/70 p-6 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
        <span className="inline-flex rounded-full bg-celo-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-celo-green">Invite link</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">Join {inviteGroup.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
          Start contributing in minutes with your MiniPay wallet. This invite works without connecting first.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contribution</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{contributionLabel} cUSD</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Frequency</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{formatFrequencyLabel(inviteGroup.frequencyInDays)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Members</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">
              {inviteGroup.memberCount} / {inviteGroup.maxMembers.toString()}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Group address</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{inviteGroup.groupAddress}</p>
          </div>
        </div>

        <div className="mt-6 max-w-xl">
          <InviteJoinActions groupId={inviteGroup.groupId} groupAddress={inviteGroup.groupAddress} inviteCode={inviteGroup.inviteCode} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_20px_80px_rgba(16,42,44,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-celo-green">How AjoChain works</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-celo-green">1) Contribute weekly</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Members contribute {contributionLabel} cUSD each round through MiniPay.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-celo-green">2) Smart contract pays out each turn</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">When all members contribute, payout runs automatically to the next member.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-celo-green">3) Complete cycle, earn certificate</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Finish all rounds and each member receives an on-chain completion credential.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
