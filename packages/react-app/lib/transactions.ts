import type { Hash } from "viem";

const CELOSCAN_BASE_URL = "https://celoscan.io";

export function getCeloscanTxUrl(txHash: Hash | undefined) {
  if (!txHash) {
    return "";
  }

  return `${CELOSCAN_BASE_URL}/tx/${txHash}`;
}
