import type { Hex } from "viem";
import { INVITE_CACHE_TTL_MS } from "@/app/api/_lib/constants";
import { getInviteGroupInfo, normalizeInviteCode } from "@/lib/contracts/invite";

type InviteMetadata = {
  inviteCode: Hex;
  groupAddress: `0x${string}`;
  name: string;
  amount: string;
  frequency: string;
  memberCount: number;
  maxMembers: string;
};

type CacheEntry = {
  value: InviteMetadata | null;
  expiresAt: number;
};

const inviteCache = new Map<string, CacheEntry>();

export async function getCachedInviteMetadata(rawCode: string): Promise<InviteMetadata | null> {
  const inviteCode = normalizeInviteCode(rawCode);
  if (!inviteCode) {
    return null;
  }

  const now = Date.now();
  const cacheKey = inviteCode.toLowerCase();
  const existing = inviteCache.get(cacheKey);

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const group = await getInviteGroupInfo(inviteCode);
  const value: InviteMetadata | null = group
    ? {
        inviteCode: group.inviteCode,
        groupAddress: group.groupAddress,
        name: group.name,
        amount: group.contributionAmount.toString(),
        frequency: group.frequencyInDays.toString(),
        memberCount: group.memberCount,
        maxMembers: group.maxMembers.toString(),
      }
    : null;

  inviteCache.set(cacheKey, {
    value,
    expiresAt: now + INVITE_CACHE_TTL_MS,
  });

  return value;
}
