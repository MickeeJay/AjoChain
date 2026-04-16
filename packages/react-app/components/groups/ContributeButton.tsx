"use client";

type ContributeButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
};

export function ContributeButton({ disabled, isLoading, onClick }: ContributeButtonProps) {
  const label = isLoading ? "Submitting..." : "Contribute cUSD";

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
    >
      {label}
    </button>
  );
}
