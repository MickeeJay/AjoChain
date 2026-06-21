"use client";

import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { PrivyLoginButton } from "@/components/shared/PrivyLoginButton";
import { useMiniPay } from "@/hooks/useMiniPay";
import { cn } from "@/lib/utils";

type WalletRequiredCardProps = {
  title?: string;
  description?: string;
  className?: string;
  buttonClassName?: string;
  fullWidthButton?: boolean;
};

export function WalletRequiredCard({
  title = "Wallet or Sign-In Required",
  description = "Sign in with email or connect a mobile wallet to start saving. We will automatically create a secure Celo savings wallet for you if you don't have one.",
  className,
  buttonClassName,
  fullWidthButton = true,
}: WalletRequiredCardProps) {
  const { isMiniPay, isConnected } = useMiniPay();

  if (isConnected) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-400",
        className,
      )}
    >
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      {isMiniPay ? (
        <ConnectWalletButton isMiniPay={isMiniPay} fullWidth={fullWidthButton} className={cn("mt-4", buttonClassName)} />
      ) : (
        <PrivyLoginButton fullWidth={fullWidthButton} className={cn("mt-4", buttonClassName)} label="Sign In / Connect Wallet" />
      )}
    </section>
  );
}

