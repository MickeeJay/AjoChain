import { createPublicClient, http, type Address, zeroAddress } from "viem";
import { AJO_CREDENTIAL_ABI } from "@/lib/contracts/abis";
import { celoAlfajores, celoMainnet } from "@/lib/celo";
import { decodeCredentialTokenUri, readNumericAttribute, readTextAttribute } from "@/lib/contracts/credential";
import { addresses } from "@/lib/contracts/addresses";
import type { CredentialTokenMetadata } from "@/types";

type CredentialRecord = readonly [Address, Address, bigint, bigint, bigint, string];

type CredentialNetworkContext = {
  chainId: 42220 | 44787;
  credentialAddress: Address;
  rpcUrl: string;
};

export type PublicCredentialPayload = {
  chainId: 42220 | 44787;
  credentialAddress: Address;
  tokenId: bigint;
  tokenUri: string;
  metadata: CredentialTokenMetadata;
  recipient: Address | null;
  groupContract: Address | null;
  groupName: string;
  cyclesCompleted: bigint;
  totalSaved: bigint;
  completedAt: bigint;
};

function getCredentialNetworkContexts(): CredentialNetworkContext[] {
  const contexts: CredentialNetworkContext[] = [];

  if (addresses[42220].credential !== zeroAddress) {
    contexts.push({
      chainId: 42220,
      credentialAddress: addresses[42220].credential,
      rpcUrl: celoMainnet.rpcUrls.default.http[0],
    });
  }

  if (addresses[44787].credential !== zeroAddress) {
    contexts.push({
      chainId: 44787,
      credentialAddress: addresses[44787].credential,
      rpcUrl: celoAlfajores.rpcUrls.default.http[0],
    });
  }

  return contexts;
}

async function tryFetchCredentialPayload(context: CredentialNetworkContext, tokenId: bigint): Promise<PublicCredentialPayload | null> {
  const chain = context.chainId === 44787 ? celoAlfajores : celoMainnet;
  const client = createPublicClient({ chain, transport: http(context.rpcUrl) });

  try {
    const tokenUri = (await client.readContract({
      address: context.credentialAddress,
      abi: AJO_CREDENTIAL_ABI,
      functionName: "tokenURI",
      args: [tokenId],
    })) as string;

    const metadata = decodeCredentialTokenUri(tokenUri);

    let record: CredentialRecord | null = null;
    try {
      record = (await client.readContract({
        address: context.credentialAddress,
        abi: AJO_CREDENTIAL_ABI,
        functionName: "credentials",
        args: [tokenId],
      })) as CredentialRecord;
    } catch {
      record = null;
    }

    const recipient = record?.[0] ?? null;
    const groupContract = record?.[1] ?? null;
    const cyclesCompleted = record?.[2] ?? readNumericAttribute(metadata, "cyclesCompleted") ?? 0n;
    const totalSaved = record?.[3] ?? readNumericAttribute(metadata, "totalSaved") ?? 0n;
    const completedAt = record?.[4] ?? readNumericAttribute(metadata, "completedAt") ?? 0n;
    const groupName = record?.[5] ?? readTextAttribute(metadata, "groupName") ?? "Savings Group";

    return {
      chainId: context.chainId,
      credentialAddress: context.credentialAddress,
      tokenId,
      tokenUri,
      metadata,
      recipient,
      groupContract,
      groupName,
      cyclesCompleted,
      totalSaved,
      completedAt,
    };
  } catch {
    return null;
  }
}

export async function fetchPublicCredential(tokenId: bigint): Promise<PublicCredentialPayload | null> {
  const contexts = getCredentialNetworkContexts();
  for (const context of contexts) {
    const payload = await tryFetchCredentialPayload(context, tokenId);
    if (payload) {
      return payload;
    }
  }

  return null;
}

export function getCredentialExplorerTokenUrl(chainId: 42220 | 44787, contractAddress: Address, tokenId: bigint) {
  const baseUrl = chainId === 44787 ? "https://alfajores.celoscan.io" : "https://celoscan.io";
  return `${baseUrl}/token/${contractAddress}?a=${tokenId.toString()}`;
}
