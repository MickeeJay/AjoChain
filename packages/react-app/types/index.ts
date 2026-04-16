export type NetworkId = 42220 | 44787;

export type TransactionState = "idle" | "pending" | "success" | "error";

export type AjoMember = {
  address: `0x${string}`;
  displayName: string;
  hasPaid: boolean;
  joinedAt?: number;
};

export type AjoGroupSummary = {
  id: string;
  name: string;
  status: "Active" | "Contributing" | "Completed";
  contributionAmount: string;
  currentCycle: number;
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

export type ContractAddressMap = Record<NetworkId, { factory: `0x${string}`; cusd: `0x${string}` }>;
