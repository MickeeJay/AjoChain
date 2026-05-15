type RoundCountdownProps = {
  secondsLeft: number;
};

function toTimeParts(secondsLeft: number) {
  if (!Number.isFinite(secondsLeft) || secondsLeft <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(secondsLeft / 86_400);
  const hours = Math.floor((secondsLeft % 86_400) / 3_600);
  const minutes = Math.floor((secondsLeft % 3_600) / 60);

  return { days, hours, minutes };
}

function formatCountdownLabel(secondsLeft: number) {
  if (!Number.isFinite(secondsLeft) || secondsLeft <= 0) {
    return "Round closed";
  }

  const { days, hours, minutes } = toTimeParts(secondsLeft);
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} day${days === 1 ? "" : "s"}`);
    parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    return `Round closes in ${parts.join(" ")}`;
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    parts.push(`${minutes} min`);
    return `Round closes in ${parts.join(" ")}`;
  }

  if (minutes <= 0) {
    return "Round closes in less than a minute";
  }

  return `Round closes in ${minutes} min`;
}

export function RoundCountdown({ secondsLeft }: RoundCountdownProps) {
  const label = formatCountdownLabel(secondsLeft);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Round countdown</p>
      <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{label}</p>
    </div>
  );
}
