"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import type { Address, Hash } from "viem";
import { formatCusdFromWei } from "@/lib/formatters";
import { getCeloscanTxUrl } from "@/lib/transactions";
import { shortenAddress } from "@/lib/utils";
import type { ContributionFlowStep } from "@/hooks/useAjoGroup";

const CONFETTI_COLORS = ["#10b981", "#facc15", "#22c55e", "#0ea5e9", "#fb7185", "#14b8a6"];

type ContributeButtonProps = {
  allowance: bigint;
  contributionAmount: bigint;
  disabled?: boolean;
  isContributing?: boolean;
  flowStep: ContributionFlowStep;
  approveTxHash?: Hash;
  contributeTxHash?: Hash;
  lastPayoutRecipient?: Address | null;
  onClick: () => void;
};

export function ContributeButton({
  allowance,
  contributionAmount,
  disabled,
  isContributing,
  flowStep,
  approveTxHash,
  contributeTxHash,
  lastPayoutRecipient,
  onClick,
}: ContributeButtonProps) {
  const requiresApproval = allowance < contributionAmount;
  const allowanceLabel = `$${formatCusdFromWei(allowance)}`;
  const requiredLabel = `$${formatCusdFromWei(contributionAmount)}`;
  const isBusy = isContributing || flowStep === "approving" || flowStep === "contributing" || flowStep === "confirming";
  const txHash = flowStep === "approving" ? approveTxHash : contributeTxHash ?? approveTxHash;

  const buttonLabel = (() => {
    if (flowStep === "approving") {
      return "Approving...";
    }

    if (flowStep === "contributing") {
      return "Contributing...";
    }

    if (flowStep === "confirming") {
      return "Confirming...";
    }

    if (flowStep === "success") {
      return "Contributed! 🎉";
    }

    if (flowStep === "failed") {
      return "Try contribution again";
    }

    if (requiresApproval) {
      return "Approve then Contribute";
    }

    return `Contribute ${requiredLabel} cUSD`;
  })();

  const buttonTone = flowStep === "success" ? "bg-emerald-700 hover:bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Allowance {allowanceLabel} / Required {requiredLabel}
      </p>

      <div className="relative overflow-hidden rounded-2xl">
        {flowStep === "success" ? (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={`confetti-${index}`}
                className="absolute top-0 h-2 w-1.5 animate-[confetti-fall_900ms_ease-out_forwards]"
                style={{
                  left: `${(index * 5.4) % 100}%`,
                  backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                  animationDelay: `${(index % 6) * 40}ms`,
                }}
              />
            ))}
          </div>
        ) : null}

        <button
          type="button"
          disabled={disabled || isBusy}
          onClick={onClick}
          className={`inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-emerald-300 ${buttonTone}`}
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {flowStep === "success" ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
          <span>{buttonLabel}</span>
        </button>
      </div>

      {txHash && isBusy ? (
        <a href={getCeloscanTxUrl(txHash)} target="_blank" rel="noreferrer" className="inline-flex text-xs font-semibold text-celo-green underline-offset-2 hover:underline">
          View transaction on Celoscan
        </a>
      ) : null}

      {flowStep === "success" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          Contributed! 🎉
          {lastPayoutRecipient ? ` Payout executed to ${shortenAddress(lastPayoutRecipient)}!` : " Your member status is updated."}
        </div>
      ) : null}
    </div>
  );
}
