"use client";

import Image from "next/image";
import Link from "next/link";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { PrivyLoginButton } from "@/components/shared/PrivyLoginButton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useCUSD } from "@/hooks/useCUSD";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { formatCusdAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { SHELL_HEADER_HEIGHT_PX, SHELL_MAX_WIDTH_PX } from "./shell.constants";
import appIcon from "@/app/assets/android-chrome-192x192.png";
import { LogOut } from "lucide-react";

export function ShellHeader() {
  const { isMiniPay, isLoading, isConnected, address, chainId, disconnect } = useMiniPay();
  const { isSignedIn, userLabel, walletAddress } = useAuthStatus();
  const resolvedChainId = chainId === 44787 ? 44787 : 42220;
  const { balance } = useCUSD({ owner: address, chainId: resolvedChainId });
  const showWalletStatus = !isMiniPay && !isLoading && isConnected;

  const networkLabel = resolvedChainId === 44787 ? "Celo testnet" : "Celo mainnet";
  const balanceLabel = !isLoading && isConnected && balance ? `cUSD ${formatCusdAmount(balance.formatted)}` : "cUSD --";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80"
      style={{ height: SHELL_HEADER_HEIGHT_PX }}
    >
      <div className="mx-auto flex h-full w-full items-center justify-between gap-3 px-4" style={{ maxWidth: SHELL_MAX_WIDTH_PX }}>
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          <Image src={appIcon} alt="AjoChain" width={28} height={28} className="h-7 w-7 rounded-xl" priority />
          <span className="text-[#35D07F]">AjoChain</span>
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          <ThemeToggle className="shrink-0" />
          {isConnected ? (
            <div className="flex min-w-0 items-center gap-2">
              {showWalletStatus ? <span className="h-2 w-2 rounded-full bg-celo-green" aria-hidden="true" /> : null}
              <span
                className={cn(
                  "hidden sm:inline-flex min-h-10 max-w-[118px] items-center rounded-full px-3 text-[14px] font-medium whitespace-nowrap",
                  !isLoading
                    ? "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    : "border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500",
                )}
                title={networkLabel}
              >
                <span className="truncate">{networkLabel}</span>
              </span>
              <span
                className={cn(
                  "inline-flex min-h-10 max-w-[110px] sm:max-w-[132px] items-center rounded-full px-3 text-[13px] sm:text-[14px] font-semibold whitespace-nowrap",
                  !isLoading
                    ? "border border-celo-green/20 bg-white text-slate-900 shadow-sm dark:border-emerald-400/30 dark:bg-slate-950 dark:text-slate-100"
                    : "border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500",
                )}
                title={balanceLabel}
              >
                <span className="truncate">{balanceLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => void disconnect()}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 transition shadow-sm shrink-0"
                title="Disconnect Wallet"
                aria-label="Disconnect Wallet"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : isSignedIn ? (
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-celo-green" aria-hidden="true" />
              {walletAddress ? (
                <span
                  className="inline-flex min-h-10 max-w-[150px] items-center rounded-full border border-celo-green/20 bg-white px-3 text-[13px] font-semibold text-slate-900 whitespace-nowrap shadow-sm dark:border-emerald-400/30 dark:bg-slate-950 dark:text-slate-100"
                  title={walletAddress}
                >
                  <span className="truncate">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
                </span>
              ) : (
                <span
                  className="inline-flex min-h-10 max-w-[150px] items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-[13px] font-semibold text-emerald-700 whitespace-nowrap dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                  title={userLabel}
                >
                  <span className="truncate">{userLabel}</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => void disconnect()}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 transition shadow-sm shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : isMiniPay ? (
            <ConnectWalletButton
              isMiniPay={isMiniPay}
              className="min-h-10 px-4 py-2 text-xs font-semibold"
              miniPayLabel="Open MiniPay"
              defaultLabel="Connect / Sign In"
            />
          ) : (
            <PrivyLoginButton
              className="min-h-10 px-4 py-2 text-xs font-semibold"
              label="Connect / Sign In"
            />
          )}
        </div>
      </div>
    </header>
  );
}