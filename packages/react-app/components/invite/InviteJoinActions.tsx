"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Hex } from "viem";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { useAjoFactory } from "@/hooks/useAjoFactory";
import { useMiniPay } from "@/hooks/useMiniPay";

const MINIPAY_ANDROID_URL = "https://play.google.com/store/apps/details?id=com.opera.minipay";
const MINIPAY_IOS_URL = "https://apps.apple.com/de/app/minipay-easy-global-wallet/id6504087257?l=en-GB";

type InviteJoinActionsProps = {
  groupId: bigint;
  groupAddress: `0x${string}`;
  inviteCode: Hex;
};

export function InviteJoinActions({ groupId, groupAddress, inviteCode }: InviteJoinActionsProps) {
  const router = useRouter();
  const { isMiniPay, isConnected, chainId, isWrongNetwork, switchToCeloMainnet, isConnecting, error: walletError } = useMiniPay();
  const { joinGroup, isJoining } = useAjoFactory();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleJoin = async () => {
    if (isWrongNetwork) {
      setErrorMessage("Switch MiniPay to Celo Mainnet (42220) before joining this group.");
      return;
    }

    if (!isConnected) {
      setErrorMessage("Connect your wallet to join this group.");
      return;
    }

    try {
      setErrorMessage(null);
      await joinGroup(groupId, inviteCode as `0x${string}`);
      router.push(`/groups/${groupAddress}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to join this group right now.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="space-y-3">
      {isMiniPay ? <p className="text-sm font-semibold text-emerald-700">Join with your MiniPay wallet</p> : null}

      {!isConnected ? <ConnectWalletButton isMiniPay={isMiniPay} fullWidth /> : null}

      {isWrongNetwork && chainId !== undefined ? (
        <button
          type="button"
          onClick={() => void switchToCeloMainnet()}
          disabled={isConnecting}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isConnecting ? "Switching network" : "Switch to Celo Mainnet"}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => void handleJoin()}
        disabled={isJoining || isWrongNetwork || !isConnected}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-celo-green px-5 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {isJoining ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {isMiniPay ? "Join with your MiniPay wallet" : "Join this group"}
      </button>

      <a
        href={MINIPAY_ANDROID_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
      >
        Download MiniPay
      </a>

      <p className="text-center text-xs text-slate-500">
        On iOS? Download MiniPay from the
        <a href={MINIPAY_IOS_URL} target="_blank" rel="noreferrer" className="ml-1 font-semibold text-celo-green underline-offset-2 hover:underline">
          App Store
        </a>
        .
      </p>

      {walletError ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{walletError}</p> : null}
      {errorMessage ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{errorMessage}</p> : null}
    </div>
  );
}
