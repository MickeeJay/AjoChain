"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseUnits } from "viem";
import { useAjoFactory } from "@/hooks/useAjoFactory";
import { useMiniPay } from "@/hooks/useMiniPay";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { WalletRequiredCard } from "@/components/shared/WalletRequiredCard";
import { cn } from "@/lib/utils";

type CreateGroupFormProps = {
  template?: string;
  onSubmit?: (value: {
    name: string;
    contributionAmount: string;
    members: string;
    cycleDuration: string;
  }) => void;
};

const TEMPLATE_PRESETS: Record<string, { label: string; name: string; contributionAmount: string; members: string; cycleDuration: string }> = {
  "weekly-market": {
    label: "Weekly Market Circle",
    name: "Weekly Market Circle",
    contributionAmount: "10",
    members: "5",
    cycleDuration: "7",
  },
  "daily-coop": {
    label: "Daily Cooperative Pot",
    name: "Daily Cooperative Pot",
    contributionAmount: "5",
    members: "7",
    cycleDuration: "1",
  },
  "monthly-growth": {
    label: "Monthly Growth Club",
    name: "Monthly Growth Club",
    contributionAmount: "20",
    members: "10",
    cycleDuration: "30",
  },
};

function resolveTemplatePreset(template?: string) {
  if (!template) {
    return null;
  }

  return TEMPLATE_PRESETS[template] ?? null;
}

export function CreateGroupForm({ template, onSubmit }: CreateGroupFormProps) {
  const router = useRouter();
  const { createGroup, isCreating, error: contractError } = useAjoFactory();
  const { isConnected, isWrongNetwork } = useMiniPay();
  const preset = resolveTemplatePreset(template);
  const [step, setStep] = useState(1);
  const [name, setName] = useState(preset?.name ?? "Market Traders Circle");
  const [contributionAmount, setContributionAmount] = useState(preset?.contributionAmount ?? "10");
  const [members, setMembers] = useState(preset?.members ?? "5");
  const [cycleDuration, setCycleDuration] = useState(preset?.cycleDuration ?? "7");
  const [formError, setFormError] = useState<string | null>(null);
  const [txState, setTxState] = useState<"idle" | "pending" | "success" | "error">("idle");

  const maxSteps = 5;
  const amountPattern = /^(\d+(\.\d{0,2})?)?$/;
  const selectedMembers = Number(members);
  const selectedContribution = Number(contributionAmount);
  const selectedFrequency = Number(cycleDuration);
  const estimatedPot = Number.isFinite(selectedContribution) && Number.isFinite(selectedMembers) ? selectedContribution * selectedMembers : 0;
  const frequencyLabelMap: Record<number, string> = {
    1: "Daily",
    7: "Weekly",
    30: "Monthly",
  };

  const validateStep = (targetStep: number): string | null => {
    if (targetStep === 1 && name.trim().length === 0) {
      return "Group name is required.";
    }

    if (targetStep === 2 && (!Number.isFinite(selectedContribution) || selectedContribution <= 0)) {
      return "Contribution amount must be greater than 0.";
    }

    if (targetStep === 3 && ![1, 7, 30].includes(selectedFrequency)) {
      return "Select a valid schedule.";
    }

    if (targetStep === 4 && (!Number.isFinite(selectedMembers) || selectedMembers < 3 || selectedMembers > 20)) {
      return "Group size must be between 3 and 20 members.";
    }

    return null;
  };

  const nextStep = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setStep((current) => Math.min(current + 1, maxSteps));
  };

  const previousStep = () => {
    setFormError(null);
    setStep((current) => Math.max(current - 1, 1));
  };

  return (
    <form
      className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_16px_50px_rgba(16,42,44,0.08)] dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100"
      onSubmit={(event) => {
        event.preventDefault();

        if (step < maxSteps) {
          nextStep();
          return;
        }

        const validationError = validateStep(1) ?? validateStep(2) ?? validateStep(3) ?? validateStep(4);
        if (validationError) {
          setFormError(validationError);
          return;
        }

        if (!isConnected) {
          setFormError("Connect your wallet before creating a group.");
          return;
        }

        if (isWrongNetwork) {
          setFormError("Switch to Celo Mainnet (42220) before creating a group.");
          return;
        }

        const create = async () => {
          try {
            setFormError(null);
            setTxState("pending");

            const result = await createGroup({
              name: name.trim(),
              amount: parseUnits(contributionAmount, 18),
              frequency: selectedFrequency,
              maxMembers: selectedMembers,
            });

            onSubmit?.({
              name: name.trim(),
              contributionAmount,
              members,
              cycleDuration,
            });

            setTxState("success");
            router.push(`/groups/${result.groupAddress}`);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to create group right now.";
            setFormError(message);
            setTxState("error");
          }
        };

        void create();
      }}
    >
      <TransactionStatus
        status={txState === "idle" ? "idle" : txState}
        label={
          txState === "pending"
            ? "Creating group on-chain"
            : txState === "success"
              ? "Group created successfully"
              : txState === "error"
                ? "Transaction failed"
                : "Ready to create"
        }
      />

      <WalletRequiredCard
        title="Wallet required to create"
        description="Connect a wallet to create a savings group on-chain. Google sign-in is for exploring only."
        className="bg-slate-50 dark:bg-slate-900/60"
      />

      <div className="space-y-2">
        <div className="flex gap-1">
          {Array.from({ length: maxSteps }, (_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                index < step ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700",
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[9px] minipay:text-[10px] xs:text-xs font-medium text-slate-400 dark:text-slate-500">
          <span className={step >= 1 ? "text-emerald-700 dark:text-emerald-300" : ""}>Name</span>
          <span className={step >= 2 ? "text-emerald-700 dark:text-emerald-300" : ""}>Amount</span>
          <span className={step >= 3 ? "text-emerald-700 dark:text-emerald-300" : ""}>Schedule</span>
          <span className={step >= 4 ? "text-emerald-700 dark:text-emerald-300" : ""}>Size</span>
          <span className={step >= 5 ? "text-emerald-700 dark:text-emerald-300" : ""}>Review</span>
        </div>
      </div>

      {preset ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          Template loaded: {preset.label}
        </p>
      ) : null}

      {step === 1 ? (
        <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Name your group
          <input
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 32))}
            maxLength={32}
            placeholder="e.g. Market Traders Circle"
            className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition placeholder:text-slate-400 focus:border-celo-green dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">{name.length}/32 characters</span>
        </label>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Set contribution amount (cUSD)</p>
          <div className="grid grid-cols-3 gap-2 minipay:grid-cols-5">
            {["1", "5", "10", "20", "50"].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setContributionAmount(amount)}
                className={[
                  "min-h-11 rounded-xl border px-2 text-sm font-semibold transition",
                  contributionAmount === amount
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500",
                ].join(" ")}
              >
                {amount} cUSD
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Custom amount
            <input
              value={contributionAmount}
              onChange={(event) => {
                const value = event.target.value;
                if (amountPattern.test(value)) {
                  setContributionAmount(value);
                }
              }}
              inputMode="decimal"
              placeholder="Enter custom amount"
              className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition placeholder:text-slate-400 focus:border-celo-green dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            Estimated pot size: ${estimatedPot.toFixed(2)}
          </p>
          {estimatedPot >= 450 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
              Warning: payout pot is approaching the $500 reward cap.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Set schedule</p>
          <div className="grid grid-cols-1 minipay:grid-cols-3 gap-2">
            {[
              { label: "Daily", days: "1" },
              { label: "Weekly", days: "7" },
              { label: "Monthly", days: "30" },
            ].map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => setCycleDuration(option.days)}
                className={[
                  "min-h-16 rounded-2xl border px-3 py-3 text-left transition",
                  cycleDuration === option.days
                    ? "border-emerald-600 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/15"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-500",
                ].join(" ")}
              >
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{option.label}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{option.days} day(s) between payouts</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Set size</p>
          <input
            type="range"
            min={3}
            max={20}
            value={members}
            onChange={(event) => setMembers(event.target.value)}
            className="w-full accent-emerald-600 dark:accent-emerald-400"
          />
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <span>{members} members</span>
            <span>Total pot: {estimatedPot.toFixed(2)} cUSD</span>
          </div>
          {estimatedPot >= 450 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
              Warning: payout pot is approaching the $500 reward cap.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 5 ? (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Review</p>
          <p>Group: {name.trim()}</p>
          <p>Contribution: {Number(contributionAmount || 0).toFixed(2)} cUSD</p>
          <p>Frequency: {frequencyLabelMap[selectedFrequency] ?? `Every ${selectedFrequency} day(s)`}</p>
          <p>Size: {members} members</p>
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">Payout pot: {estimatedPot.toFixed(2)} cUSD</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated gas cost: ~0.001 cUSD on Celo</p>
          {estimatedPot >= 450 ? (
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Heads up: this setup is close to the $500 cap.</p>
          ) : null}
        </div>
      ) : null}

      {formError ? <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{formError}</p> : null}
      {!formError && contractError ? <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{contractError}</p> : null}
      {!formError && !isConnected ? (
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Connect your wallet to continue this setup.</p>
      ) : null}
      {!formError && isConnected && isWrongNetwork ? (
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
          Switch wallet network to Celo Mainnet or Alfajores testnet to create this group.
        </p>
      ) : null}

      <div className="flex flex-col-reverse minipay:flex-row items-center gap-2">
        <button
          type="button"
          onClick={previousStep}
          disabled={step === 1 || isCreating}
          className="inline-flex min-h-12 w-full minipay:flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-500"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isCreating || !isConnected || isWrongNetwork}
          className="inline-flex min-h-12 w-full minipay:flex-1 justify-center items-center rounded-full bg-celo-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300 dark:disabled:bg-slate-700"
        >
          {isCreating ? "Creating..." : step === maxSteps ? "Create Group" : "Next"}
        </button>
      </div>
    </form>
  );
}
