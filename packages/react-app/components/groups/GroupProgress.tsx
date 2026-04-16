type GroupProgressProps = {
  current: number;
  total: number;
};

export function GroupProgress({ current, total }: GroupProgressProps) {
  const percentage = total === 0 ? 0 : Math.min((current / total) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        <span>Contribution progress</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
