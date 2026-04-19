"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseUnits } from "viem";
import { useAjoFactory } from "@/hooks/useAjoFactory";
import { TransactionStatus } from "@/components/shared/TransactionStatus";

type CreateGroupFormProps = {
  onSubmit?: (value: {
    name: string;
    contributionAmount: string;
    members: string;
    cycleDuration: string;
  }) => void;
};

export function CreateGroupForm({ onSubmit }: CreateGroupFormProps) {
  const router = useRouter();
  const { createGroup, isCreating, error: contractError } = useAjoFactory();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Market Traders Circle");
  const [contributionAmount, setContributionAmount] = useState("10");
  const [members, setMembers] = useState("5");
  const [cycleDuration, setCycleDuration] = useState("7");
  const [formError, setFormError] = useState<string | null>(null);
  const [txState, setTxState] = useState<"idle" | "pending" | "success" | "error">("idle");

  const maxSteps = 5;
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
      className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_50px_rgba(16,42,44,0.08)]"
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

      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <span>Step {step} of {maxSteps}</span>
        <span>{Math.round((step / maxSteps) * 100)}%</span>
      </div>

      {step === 1 ? (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name your group
          <input
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 32))}
            maxLength={32}
            placeholder="e.g. Market Traders Circle"
            className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-celo-green"
          />
          <span className="text-xs text-slate-500">{name.length}/32 characters</span>
        </label>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-slate-700">Set contribution amount (cUSD)</p>
          <div className="grid grid-cols-5 gap-2">
            {["1", "5", "10", "20", "50"].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setContributionAmount(amount)}
                className={[
                  "min-h-11 rounded-xl border px-2 text-sm font-semibold transition",
                  contributionAmount === amount ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                ].join(" ")}
              >
                ${amount}
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Custom amount
            <input
              value={contributionAmount}
              onChange={(event) => setContributionAmount(event.target.value)}
              inputMode="decimal"
              className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-celo-green"
            />
          </label>
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            Estimated pot size: ${estimatedPot.toFixed(2)}
          </p>
          {estimatedPot >= 450 ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Warning: payout pot is approaching the $500 reward cap.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-slate-700">Set schedule</p>
          <div className="grid gap-2 sm:grid-cols-3">
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
                  cycleDuration === option.days ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300",
                ].join(" ")}
              >
                <p className="text-base font-semibold text-slate-900">{option.label}</p>
                <p className="text-xs font-medium text-slate-500">{option.days} day(s) between payouts</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-slate-700">Set size</p>
          <input
            type="range"
            min={3}
            max={20}
            value={members}
            onChange={(event) => setMembers(event.target.value)}
            className="w-full accent-emerald-600"
          />
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            <span>{members} members</span>
            <span>pot = ${estimatedPot.toFixed(2)} per person</span>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Review</p>
          <p>Group: {name.trim()}</p>
          <p>Contribution: ${Number(contributionAmount || 0).toFixed(2)} cUSD</p>
          <p>Frequency: {frequencyLabelMap[selectedFrequency] ?? `Every ${selectedFrequency} day(s)`}</p>
          <p>Size: {members} members</p>
          <p className="font-semibold text-emerald-700">Payout pot: ${estimatedPot.toFixed(2)}</p>
          <p className="text-xs font-medium text-slate-500">Estimated gas cost: ~$0.001 on Celo</p>
        </div>
      ) : null}

      {formError ? <p className="text-sm font-medium text-rose-600">{formError}</p> : null}
      {!formError && contractError ? <p className="text-sm font-medium text-rose-600">{contractError}</p> : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={previousStep}
          disabled={step === 1 || isCreating}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isCreating}
          className="inline-flex min-h-12 flex-1 justify-center rounded-full bg-celo-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isCreating ? "Creating..." : step === maxSteps ? "Create Group" : "Next"}
        </button>
      </div>
    </form>
  );
}
