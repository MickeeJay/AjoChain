"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useCUSD } from "@/hooks/useCUSD";
import { useMiniPay } from "@/hooks/useMiniPay";
import { formatCusdAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function ShellHeader() {
  const { address, chainId } = useAccount();
  const { isMiniPay, isReady, isConnected } = useMiniPay();
  const resolvedChainId = chainId === 44787 ? 44787 : 42220;
  const { balance } = useCUSD({ owner: address, chainId: resolvedChainId });
  const showWalletStatus = !isMiniPay && isReady && isConnected;

  const networkLabel = resolvedChainId === 44787 ? "Celo testnet" : "Celo mainnet";
  const balanceLabel = isReady && isConnected && balance ? `cUSD ${formatCusdAmount(balance.formatted)}` : "cUSD --";

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full w-full max-w-[430px] items-center justify-between gap-3 px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-celo-green">
          AjoChain
        </Link>

        <div className="flex items-center gap-2">
          {showWalletStatus ? <span className="h-2 w-2 rounded-full bg-celo-green" aria-hidden="true" /> : null}
          <span
            className={cn(
              "inline-flex min-h-9 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap",
              isReady ? "border border-slate-200 bg-slate-50 text-slate-700" : "border border-slate-200 bg-white text-slate-400",
            )}
          >
            {networkLabel}
          </span>
          <span
            className={cn(
              "inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold whitespace-nowrap",
              isReady ? "border border-celo-green/20 bg-white text-slate-900 shadow-sm" : "border border-slate-200 bg-white text-slate-400",
            )}
          >
            {balanceLabel}
          </span>
        </div>
      </div>
    </header>
  );
}