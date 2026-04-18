export type NetworkId = 42220 | 44787;

export type GroupStatus = "FORMING" | "ACTIVE" | "COMPLETED" | "PAUSED";

export interface MemberInfo {
  wallet: `0x${string}`;
  isActive: boolean;
  hasContributedThisRound?: boolean;
  totalContributed?: bigint;
  roundsCompleted?: bigint;
}

export interface GroupState {
  name: string;
  contributionAmount: bigint;
  frequencyInDays: bigint;
  maxMembers: bigint;
  currentRound: bigint;
  roundStartTime: bigint;
  payoutIndex: bigint;
  status: GroupStatus;
  members: MemberInfo[];
  memberOrder: `0x${string}`[];
  inviteCode: `0x${string}`;
  remainingTime: number;
}

export interface CreateGroupParams {
  name: string;
  amount: bigint;
  frequency: bigint | number;
  maxMembers: bigint | number;
}

export interface ContractAddresses {
  factory: `0x${string}`;
  credential: `0x${string}`;
  cUSD: `0x${string}`;
}

export interface NetworkConfig {
  chainId: NetworkId;
  name: string;
  addresses: ContractAddresses;
}

export type TransactionState = "idle" | "pending" | "success" | "error";

export type AjoMember = {
  address: `0x${string}`;
  displayName: string;
  hasPaid: boolean;
  joinedAt?: number;
};

export type AjoGroupStatus = GroupStatus;

export type AjoGroupState = GroupState & {
  factory: `0x${string}`;
  creator: `0x${string}`;
  cUSDToken: `0x${string}`;
  memberCount: bigint;
  currentPayoutRecipient: `0x${string}`;
  isCompleted: boolean;
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

export type ContractAddressMap = Record<NetworkId, ContractAddresses>;
