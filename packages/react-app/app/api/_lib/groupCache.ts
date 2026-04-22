import { isAddress, type Address, type Hex } from "viem";
import { GROUP_CACHE_TTL_MS } from "@/app/api/_lib/constants";
import { createCeloPublicClient } from "@/app/api/_lib/publicClient";
import { AJO_GROUP_ABI } from "@/lib/contracts/abis";

type GroupStateView = {
  status: number;
  factory: Address;
  creator: Address;
  cUSDToken: Address;
  name: string;
  contributionAmount: bigint;
  frequencyInDays: bigint;
  maxMembers: bigint;
  currentRound: bigint;
  roundStartTime: bigint;
  payoutIndex: bigint;
  inviteCode: Hex;
  memberOrder: Address[];
  activeMembers: Address[];
  pauseSupportVotes: bigint;
  pauseOppositionVotes: bigint;
  remainingTime: bigint;
};

export type CachedGroupState = {
  groupAddress: Address;
  name: string;
  status: number;
  contributionAmount: string;
  frequencyInDays: string;
  maxMembers: string;
  memberCount: number;
  currentRound: string;
  inviteCode: Hex;
  remainingTime: string;
};

type CacheEntry = {
  value: CachedGroupState;
  expiresAt: number;
};

const groupCache = new Map<string, CacheEntry>();

export async function getCachedGroupState(groupAddress: string): Promise<CachedGroupState | null> {
  if (!isAddress(groupAddress)) {
    return null;
  }

  const normalizedAddress = groupAddress.toLowerCase() as Address;
  const now = Date.now();
  const existing = groupCache.get(normalizedAddress);

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const { client } = createCeloPublicClient();

  const groupState = (await client.readContract({
    address: normalizedAddress,
    abi: AJO_GROUP_ABI,
    functionName: "getGroupState",
  })) as GroupStateView;

  const value: CachedGroupState = {
    groupAddress: normalizedAddress,
    name: groupState.name,
    status: Number(groupState.status),
    contributionAmount: groupState.contributionAmount.toString(),
    frequencyInDays: groupState.frequencyInDays.toString(),
    maxMembers: groupState.maxMembers.toString(),
    memberCount: groupState.activeMembers.length,
    currentRound: groupState.currentRound.toString(),
    inviteCode: groupState.inviteCode,
    remainingTime: groupState.remainingTime.toString(),
  };

  groupCache.set(normalizedAddress, {
    value,
    expiresAt: now + GROUP_CACHE_TTL_MS,
  });

  return value;
}
