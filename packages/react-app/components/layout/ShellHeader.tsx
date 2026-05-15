"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { Avatar } from "@/components/shared/Avatar";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";
import { GoogleSignOutButton } from "@/components/shared/GoogleSignOutButton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useCUSD } from "@/hooks/useCUSD";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useMiniPay } from "@/hooks/useMiniPay";
import { formatCusdAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { SHELL_HEADER_HEIGHT_PX, SHELL_MAX_WIDTH_PX } from "./shell.constants";
import appIcon from "@/app/assets/android-chrome-192x192.png";

export function ShellHeader() {
  const pathname = usePathname();
  const { isMiniPay, isLoading, isConnected, address, chainId } = useMiniPay();
  const { status, isSignedIn, userLabel, userImage } = useAuthStatus();
  const showAuthAction = status !== "loading";
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
                  "inline-flex min-h-10 max-w-[118px] items-center rounded-full px-3 text-[14px] font-medium whitespace-nowrap",
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
                  "inline-flex min-h-10 max-w-[132px] items-center rounded-full px-3 text-[14px] font-semibold whitespace-nowrap",
                  !isLoading
                    ? "border border-celo-green/20 bg-white text-slate-900 shadow-sm dark:border-emerald-400/30 dark:bg-slate-950 dark:text-slate-100"
                    : "border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500",
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
          {showAuthAction ? (
            isSignedIn ? (
              <div className="flex items-center gap-2">
                <Avatar name={userLabel} imageUrl={userImage} size="sm" />
                <GoogleSignOutButton
                  className="min-h-10 px-3 py-2 text-xs font-semibold"
                  label="Sign out"
                  callbackUrl={pathname ?? "/"}
                />
              </div>
            ) : (
              <GoogleSignInButton className="min-h-10 px-3 py-2 text-xs font-semibold" label="Sign in" />
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}