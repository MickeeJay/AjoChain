"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEventLogs, type Address, type Hash, type TransactionReceipt, zeroAddress } from "viem";
import { AJO_FACTORY_ABI } from "@/lib/contracts/abis";
import { addresses } from "@/lib/contracts/addresses";
import type { CreateGroupParams, NetworkId } from "@/types";

type ReceiptResolver<T> = {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected contract error occurred.";
}

function resolveNetworkId(chainId: number | undefined): NetworkId {
  return chainId === 44787 ? 44787 : 42220;
}

function resolveFeeCurrency(networkId: NetworkId): Address {
  const feeCurrency = addresses[networkId].cUSD;

  if (feeCurrency === zeroAddress) {
    throw new Error("cUSD fee currency is not configured for this network.");
  }

  return feeCurrency;
}

export function useAjoFactory() {
  const { address: accountAddress } = useAccount();
  const chainId = useChainId();
  const networkId = resolveNetworkId(chainId);
  const contractAddress = addresses[networkId].factory;
  const { writeContractAsync } = useWriteContract();
  const [createHash, setCreateHash] = useState<Hash | undefined>();
  const [joinHash, setJoinHash] = useState<Hash | undefined>();
  const [pendingAction, setPendingAction] = useState<"create" | "join" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const createResolverRef = useRef<ReceiptResolver<TransactionReceipt> | null>(null);
  const joinResolverRef = useRef<ReceiptResolver<TransactionReceipt> | null>(null);

  const {
    data: groupCountData,
    refetch: refetchGroupCount,
    error: groupCountError,
  } = useReadContract({
    address: contractAddress,
    abi: AJO_FACTORY_ABI,
    functionName: "groupCount",
    chainId,
    query: {
      enabled: Boolean(contractAddress),
      staleTime: 10_000,
    },
  });

  const {
    data: userGroupsData,
    refetch: refetchUserGroups,
    error: userGroupsError,
  } = useReadContract({
    address: contractAddress,
    abi: AJO_FACTORY_ABI,
    functionName: "getUserGroups",
    args: accountAddress ? [accountAddress] : undefined,
    chainId,
    query: {
      enabled: Boolean(contractAddress && accountAddress),
      staleTime: 10_000,
    },
  });

  const createReceipt = useWaitForTransactionReceipt({
    hash: createHash,
    chainId,
    query: {
      enabled: Boolean(createHash),
      staleTime: 10_000,
    },
  });

  const joinReceipt = useWaitForTransactionReceipt({
    hash: joinHash,
    chainId,
    query: {
      enabled: Boolean(joinHash),
      staleTime: 10_000,
    },
  });

  useEffect(() => {
    if (!createReceipt.data || !createResolverRef.current) {
      return;
    }

    createResolverRef.current.resolve(createReceipt.data);
    createResolverRef.current = null;
    setCreateHash(undefined);
  }, [createReceipt.data]);

  useEffect(() => {
    if (!joinReceipt.data || !joinResolverRef.current) {
      return;
    }

    joinResolverRef.current.resolve(joinReceipt.data);
    joinResolverRef.current = null;
    setJoinHash(undefined);
  }, [joinReceipt.data]);

  useEffect(() => {
    if (!createReceipt.error || !createResolverRef.current) {
      return;
    }

    createResolverRef.current.reject(new Error(getErrorMessage(createReceipt.error)));
    createResolverRef.current = null;
    setCreateHash(undefined);
  }, [createReceipt.error]);

  useEffect(() => {
    if (!joinReceipt.error || !joinResolverRef.current) {
      return;
    }

    joinResolverRef.current.reject(new Error(getErrorMessage(joinReceipt.error)));
    joinResolverRef.current = null;
    setJoinHash(undefined);
  }, [joinReceipt.error]);

  const groupCount = useMemo(() => Number(groupCountData ?? 0n), [groupCountData]);
  const userGroups = useMemo(() => Array.from(userGroupsData ?? []), [userGroupsData]);

  const createGroup = async (params: CreateGroupParams) => {
    if (!accountAddress) {
      throw new Error("Connect a wallet before creating a group.");
    }

    try {
      setPendingAction("create");
      const feeCurrency = resolveFeeCurrency(networkId);
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: AJO_FACTORY_ABI,
        functionName: "createGroup",
        args: [params.name, params.amount, BigInt(params.frequency), BigInt(params.maxMembers)],
        chainId,
        feeCurrency,
      } as Parameters<typeof writeContractAsync>[0]);

      setCreateHash(txHash);

      const receipt = await new Promise<TransactionReceipt>((resolve, reject) => {
        createResolverRef.current = { resolve, reject };
      });

      const parsedLogs = parseEventLogs({
        abi: AJO_FACTORY_ABI,
        eventName: "GroupCreated",
        logs: receipt.logs,
      });
      const createdGroup = parsedLogs[0]?.args.groupAddress as Address | undefined;
      const createdGroupId = parsedLogs[0]?.args.groupId as bigint | undefined;

      if (!createdGroup) {
        throw new Error("Unable to read the created group address from the transaction receipt.");
      }

      void refetchGroupCount();
      void refetchUserGroups();
      setActionError(null);
      setPendingAction(null);

      return {
        txHash,
        groupId: createdGroupId ?? 0n,
        groupAddress: createdGroup,
      };
    } catch (error) {
      setPendingAction(null);
      const message = getErrorMessage(error);
      setActionError(message);
      throw error instanceof Error ? error : new Error(message);
    }
  };

  const joinGroup = async (groupId: bigint | number, inviteCode: `0x${string}`) => {
    if (!accountAddress) {
      throw new Error("Connect a wallet before joining a group.");
    }

    try {
      setPendingAction("join");
      const feeCurrency = resolveFeeCurrency(networkId);
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: AJO_FACTORY_ABI,
        functionName: "joinGroup",
        args: [BigInt(groupId), inviteCode],
        chainId,
        feeCurrency,
      } as Parameters<typeof writeContractAsync>[0]);

      setJoinHash(txHash);

      await new Promise<TransactionReceipt>((resolve, reject) => {
        joinResolverRef.current = { resolve, reject };
      });

      void refetchUserGroups();
      setActionError(null);
      setPendingAction(null);

      return txHash;
    } catch (error) {
      setPendingAction(null);
      const message = getErrorMessage(error);
      setActionError(message);
      throw error instanceof Error ? error : new Error(message);
    }
  };

  return {
    groupCount,
    userGroups,
    createGroup,
    joinGroup,
    isCreating: pendingAction === "create" || createReceipt.isLoading || Boolean(createHash),
    isJoining: pendingAction === "join" || joinReceipt.isLoading || Boolean(joinHash),
    error: actionError ?? groupCountError?.message ?? userGroupsError?.message ?? null,
  };
}
