"use client";

import Link from "next/link";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { useCUSD } from "@/hooks/useCUSD";
import { useMiniPay } from "@/hooks/useMiniPay";
import { formatCusdAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { SHELL_HEADER_HEIGHT_PX, SHELL_MAX_WIDTH_PX } from "./shell.constants";

export function ShellHeader() {
  const { isMiniPay, isLoading, isConnected, address, chainId } = useMiniPay();
  const resolvedChainId = chainId === 44787 ? 44787 : 42220;
  const { balance } = useCUSD({ owner: address, chainId: resolvedChainId });
  const showWalletStatus = !isMiniPay && !isLoading && isConnected;

  const networkLabel = resolvedChainId === 44787 ? "Celo testnet" : "Celo mainnet";
  const balanceLabel = !isLoading && isConnected && balance ? `cUSD ${formatCusdAmount(balance.formatted)}` : "cUSD --";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur" style={{ height: SHELL_HEADER_HEIGHT_PX }}>
      <div className="mx-auto flex h-full w-full items-center justify-between gap-3 px-4" style={{ maxWidth: SHELL_MAX_WIDTH_PX }}>
        <Link href="/" className="text-lg font-bold tracking-tight text-[#35D07F]">
          AjoChain
        </Link>

        {isConnected ? (
          <div className="flex min-w-0 items-center gap-2">
          {showWalletStatus ? <span className="h-2 w-2 rounded-full bg-celo-green" aria-hidden="true" /> : null}
          <span
            className={cn(
              "inline-flex min-h-10 max-w-[118px] items-center rounded-full px-3 text-[14px] font-medium whitespace-nowrap",
              !isLoading ? "border border-slate-200 bg-slate-50 text-slate-700" : "border border-slate-200 bg-white text-slate-400",
            )}
            title={networkLabel}
          >
            <span className="truncate">{networkLabel}</span>
          </span>
          <span
            className={cn(
              "inline-flex min-h-10 max-w-[132px] items-center rounded-full px-3 text-[14px] font-semibold whitespace-nowrap",
              !isLoading ? "border border-celo-green/20 bg-white text-slate-900 shadow-sm" : "border border-slate-200 bg-white text-slate-400",
            )}
            title={balanceLabel}
          >
            <span className="truncate">{balanceLabel}</span>
          </span>
          </div>
        ) : (
          <ConnectWalletButton
            isMiniPay={isMiniPay}
            className="min-h-10 px-4 py-2 text-xs font-semibold"
            miniPayLabel="Open MiniPay"
            defaultLabel="Connect"
          />
        )}
      </div>
    </header>
  );
}