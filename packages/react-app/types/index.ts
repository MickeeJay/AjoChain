export type NetworkId = 42220 | 44787;

export type TransactionState = "idle" | "pending" | "success" | "error";

export type AjoMember = {
  address: `0x${string}`;
  displayName: string;
  hasPaid: boolean;
  joinedAt?: number;
};

export type AjoGroupStatus = "Forming" | "Active" | "Contributing" | "Paused" | "Completed";

export type AjoGroupState = {
  factory: `0x${string}`;
  creator: `0x${string}`;
  cUSDToken: `0x${string}`;
  name: string;
  contributionAmount: bigint;
  frequencyInDays: bigint;
  maxMembers: bigint;
  currentRound: bigint;
  roundStartTime: bigint;
  payoutIndex: bigint;
  inviteCode: `0x${string}`;
  status: number;
  memberOrder: `0x${string}`[];
  memberCount: bigint;
  currentPayoutRecipient: `0x${string}`;
  isCompleted: boolean;
  remainingTime: bigint;
};

export type AjoGroupSummary = {
  id: string;
  name: string;
  status: AjoGroupStatus;
  contributionAmount: string;
  currentCycle: number;
  currentRound?: number;
  totalCycles: number;
  nextPayout: string;
  memberCount: number;
  tokenAddress: `0x${string}`;
};

export type CreateGroupPayload = {
  name: string;
  contributionAmount: bigint;
  maxMembers: number;
  cycleDuration: bigint;
  invitees: string[];
};

export type ContractAddressMap = Record<NetworkId, { factory: `0x${string}`; credential: `0x${string}`; cUSD: `0x${string}` }>;
