import type { Hash } from "viem";

export function getCeloscanTxUrl(txHash: Hash | undefined, chainId?: number) {
  if (!txHash) {
    return "";
  }

  const baseUrl = chainId === 44787 ? "https://alfajores.celoscan.io" : "https://celoscan.io";
  return `${baseUrl}/tx/${txHash}`;
}
