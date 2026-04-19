import { Check } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

type GroupProgressProps = {
  currentRound: number;
  totalRounds: number;
  memberOrder: `0x${string}`[];
  nextPayoutTo?: `0x${string}`;
};

export function GroupProgress({ currentRound, totalRounds, memberOrder, nextPayoutTo }: GroupProgressProps) {
  const timelineCount = Math.max(totalRounds, 1);
  const rounds = Array.from({ length: timelineCount }, (_, index) => index);
  const normalizedCurrentRound = Math.max(0, Math.min(currentRound, timelineCount));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <span>Round timeline</span>
        <span>
          {Math.min(normalizedCurrentRound, totalRounds)}/{totalRounds}
        </span>
      </div>

      <div className="grid gap-2">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${timelineCount}, minmax(0, 1fr))` }}>
          {rounds.map((round) => {
            const isCompleted = round < normalizedCurrentRound;
            const isCurrent = round === normalizedCurrentRound && normalizedCurrentRound < totalRounds;
            const payoutWallet = memberOrder[round];

            return (
              <div key={round} className="flex flex-col items-center gap-2">
                <div
                  className={[
                    "relative flex h-7 w-7 items-center justify-center rounded-full border",
                    isCompleted ? "border-emerald-600 bg-emerald-600" : "",
                    isCurrent ? "border-emerald-600 bg-white ring-4 ring-emerald-200" : "",
                    !isCompleted && !isCurrent ? "border-slate-300 bg-slate-100" : "",
                  ].join(" ")}
                >
                  {isCompleted ? <Check className="h-4 w-4 text-white" /> : null}
                </div>
                <p className="text-[10px] font-medium text-slate-500">{shortenAddress(payoutWallet)}</p>
              </div>
            );
          })}
        </div>

        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          Next payout to: {shortenAddress(nextPayoutTo)}
        </p>
      </div>
    </div>
  );
}
