import { cache } from "react";
import { createPublicClient, http, isAddress, type Address, type Hex, zeroAddress } from "viem";
import { celoAlfajores, celoMainnet } from "@/lib/celo";
import { AJO_FACTORY_ABI, AJO_GROUP_ABI } from "@/lib/contracts/abis";
import { addresses } from "@/lib/contracts/addresses";

const INVITE_LOOKUP_LIMIT = 250;
const INVITE_CODE_PATTERN = /^0x[a-fA-F0-9]{64}$/;

type NetworkId = 42220 | 44787;

type GroupStateView = {
  inviteCode: Hex;
  name: string;
  contributionAmount: bigint;
  frequencyInDays: bigint;
  activeMembers: Address[];
  maxMembers: bigint;
};

function resolveTargetChainId() {
  const networkId: NetworkId = process.env.NEXT_PUBLIC_CELO_CHAIN_ID === "44787" ? 44787 : 42220;

  return networkId;
}

function resolvePublicClient() {
  const chainId = resolveTargetChainId();
  const chain = chainId === 44787 ? celoAlfajores : celoMainnet;

  return {
    chainId,
    client: createPublicClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    }),
  };
}

export type InviteGroupInfo = {
  groupId: bigint;
  groupAddress: Address;
  inviteCode: Hex;
  name: string;
  contributionAmount: bigint;
  frequencyInDays: bigint;
  memberCount: number;
  maxMembers: bigint;
};

export function normalizeInviteCode(rawCode: string): Hex | null {
  if (!INVITE_CODE_PATTERN.test(rawCode)) {
    return null;
  }

  return rawCode.toLowerCase() as Hex;
}

export function formatFrequencyLabel(frequencyInDays: bigint) {
  if (frequencyInDays === 1n) {
    return "Daily";
  }

  if (frequencyInDays === 7n) {
    return "Weekly";
  }

  if (frequencyInDays === 30n) {
    return "Monthly";
  }

  return `Every ${frequencyInDays.toString()} days`;
}

export const getInviteGroupInfo = cache(async (rawCode: string): Promise<InviteGroupInfo | null> => {
  try {
    const inviteCode = normalizeInviteCode(rawCode);
    if (!inviteCode) {
      return null;
    }

    const { chainId, client } = resolvePublicClient();
    const factoryAddress = addresses[chainId].factory;

    if (!isAddress(factoryAddress) || factoryAddress === zeroAddress) {
      return null;
    }

    const groupCount = (await client.readContract({
      address: factoryAddress,
      abi: AJO_FACTORY_ABI,
      functionName: "groupCount",
    })) as bigint;

    if (groupCount === 0n) {
      return null;
    }

    const lowerBound = groupCount > BigInt(INVITE_LOOKUP_LIMIT) ? groupCount - BigInt(INVITE_LOOKUP_LIMIT) : 0n;
    const candidateGroupIds: bigint[] = [];

    for (let groupId = groupCount - 1n; groupId >= lowerBound; groupId -= 1n) {
      candidateGroupIds.push(groupId);

      if (groupId === 0n) {
        break;
      }
    }

    if (candidateGroupIds.length === 0) {
      return null;
    }

    const groupAddressResults = await client.multicall({
      contracts: candidateGroupIds.map((groupId) => ({
        address: factoryAddress,
        abi: AJO_FACTORY_ABI,
        functionName: "getGroupInfo",
        args: [groupId],
      })),
      allowFailure: true,
    });

    const candidateGroups = candidateGroupIds
      .map((groupId, index) => {
        const result = groupAddressResults[index];
        if (result.status !== "success") {
          return null;
        }

        const groupAddress = result.result as Address;
        if (!isAddress(groupAddress) || groupAddress === zeroAddress) {
          return null;
        }

        return {
          groupId,
          groupAddress,
        };
      })
      .filter((entry): entry is { groupId: bigint; groupAddress: Address } => Boolean(entry));

    if (candidateGroups.length === 0) {
      return null;
    }

    const stateResults = await client.multicall({
      contracts: candidateGroups.map((entry) => ({
        address: entry.groupAddress,
        abi: AJO_GROUP_ABI,
        functionName: "getGroupState",
      })),
      allowFailure: true,
    });

    for (const [index, result] of stateResults.entries()) {
      if (result.status !== "success") {
        continue;
      }

      const groupState = result.result as unknown as GroupStateView;
      if (groupState.inviteCode.toLowerCase() !== inviteCode) {
        continue;
      }

      const group = candidateGroups[index];

      return {
        groupId: group.groupId,
        groupAddress: group.groupAddress,
        inviteCode,
        name: groupState.name,
        contributionAmount: groupState.contributionAmount,
        frequencyInDays: groupState.frequencyInDays,
        memberCount: groupState.activeMembers.length,
        maxMembers: groupState.maxMembers,
      };
    }

    return null;
  } catch {
    return null;
  }
});
