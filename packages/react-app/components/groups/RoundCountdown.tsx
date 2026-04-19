type RoundCountdownProps = {
  secondsLeft: number;
};

function toDaysAndHours(secondsLeft: number) {
  if (!Number.isFinite(secondsLeft) || secondsLeft <= 0) {
    return { days: 0, hours: 0 };
  }

  const days = Math.floor(secondsLeft / 86_400);
  const hours = Math.floor((secondsLeft % 86_400) / 3_600);

  return { days, hours };
}

export function RoundCountdown({ secondsLeft }: RoundCountdownProps) {
  const { days, hours } = toDaysAndHours(secondsLeft);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Round countdown</p>
      <p className="mt-1 text-base font-semibold text-slate-900">Round closes in {days} day{days === 1 ? "" : "s"} {hours} hour{hours === 1 ? "" : "s"}</p>
    </div>
  );
}
