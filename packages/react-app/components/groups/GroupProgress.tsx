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
  const timelineMinWidth = Math.max(timelineCount * 64, 300);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        <span>Round timeline</span>
        <span>
          {Math.min(normalizedCurrentRound, totalRounds)}/{totalRounds}
        </span>
      </div>

      <div className="grid gap-2">
        <div className="overflow-x-auto pb-1">
          <div className="grid gap-0.5" style={{ minWidth: `${timelineMinWidth}px`, gridTemplateColumns: `repeat(${timelineCount}, minmax(0, 1fr))` }}>
            {rounds.map((round) => {
              const isCompleted = round < normalizedCurrentRound;
              const isCurrent = round === normalizedCurrentRound && normalizedCurrentRound < totalRounds;
              const payoutWallet = memberOrder[round];

              return (
                <div key={round} className="flex flex-col items-center gap-2 px-1">
                  <div
                    className={[
                      "relative flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold",
                      isCompleted ? "border-emerald-600 bg-emerald-600 text-white" : "",
                      isCurrent ? "border-emerald-600 bg-white text-emerald-600 ring-4 ring-emerald-200 dark:bg-slate-950 dark:ring-emerald-500/30" : "",
                      !isCompleted && !isCurrent ? "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500" : "",
                    ].join(" ")}
                  >
                    {isCompleted ? <Check className="h-4 w-4 text-white" /> : <span>{round + 1}</span>}
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {payoutWallet ? shortenAddress(payoutWallet) : "TBD"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
          Next payout to: {nextPayoutTo ? shortenAddress(nextPayoutTo) : "TBD"}
        </p>
      </div>
    </div>
  );
}
