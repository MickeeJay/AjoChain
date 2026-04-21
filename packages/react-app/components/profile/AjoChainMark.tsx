type AjoChainMarkProps = {
  className?: string;
};

export function AjoChainMark({ className }: AjoChainMarkProps) {
  return (
    <span className={className}>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">A</span>
      <span className="text-xs font-semibold uppercase tracking-[0.16em]">AjoChain</span>
    </span>
  );
}
