import { formatUnits } from "viem";
import { formatFrequencyLabel } from "@/lib/contracts/invite";

type ShareMessageInput = {
  appUrl: string;
  inviteCode: `0x${string}`;
  groupName: string;
  contributionAmount: bigint;
  frequencyInDays: bigint;
  memberCount: number;
  maxMembers: bigint;
};

export type SharePayload = {
  inviteUrl: string;
  whatsappMessage: string;
  whatsappDeepLink: string;
  twitterCard: {
    card: "summary_large_image";
    title: string;
    description: string;
    url: string;
  };
};

function toCusdLabel(amount: bigint): string {
  const normalized = Number(formatUnits(amount, 18));

  if (!Number.isFinite(normalized)) {
    return "0.00";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalized);
}

export function buildSharePayload(input: ShareMessageInput): SharePayload {
  const inviteUrl = `${input.appUrl.replace(/\/$/, "")}/invite/${input.inviteCode}`;
  const contributionLabel = toCusdLabel(input.contributionAmount);
  const frequencyLabel = formatFrequencyLabel(input.frequencyInDays);

  const whatsappMessage = [
    `Join my AjoChain savings group: ${input.groupName}`,
    `Contribution: ${contributionLabel} cUSD (${frequencyLabel.toLowerCase()})`,
    `Members: ${input.memberCount}/${input.maxMembers.toString()}`,
    `Invite link: ${inviteUrl}`,
  ].join("\n");

  const title = `Join ${input.groupName} on AjoChain`;
  const description = `${input.groupName}: contribute ${contributionLabel} cUSD ${frequencyLabel.toLowerCase()} with transparent on-chain payouts.`;

  return {
    inviteUrl,
    whatsappMessage,
    whatsappDeepLink: `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`,
    twitterCard: {
      card: "summary_large_image",
      title,
      description,
      url: inviteUrl,
    },
  };
}
