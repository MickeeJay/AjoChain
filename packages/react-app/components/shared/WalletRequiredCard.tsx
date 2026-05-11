"use client";

import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
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
  title = "Wallet required",
  description = "Connect a Celo wallet to create, join, or contribute to savings groups.",
  className,
  buttonClassName,
  fullWidthButton = true,
}: WalletRequiredCardProps) {
  const { isMiniPay, isConnected } = useMiniPay();

  if (isConnected) {
    return null;
  }

  return (
    <section className={cn("rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm text-slate-600", className)}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <ConnectWalletButton isMiniPay={isMiniPay} fullWidth={fullWidthButton} className={cn("mt-4", buttonClassName)} />
    </section>
  );
}
