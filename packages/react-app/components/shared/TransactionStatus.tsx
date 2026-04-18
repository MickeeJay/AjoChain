type TransactionStatusProps = {
  status: "idle" | "pending" | "success" | "error";
  label: string;
};

const styles: Record<TransactionStatusProps["status"], string> = {
  idle: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  success: "bg-emerald-100 text-emerald-800",
  error: "bg-rose-100 text-rose-800",
};

export function TransactionStatus({ status, label }: TransactionStatusProps) {
  return <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${styles[status]}`}>{label}</span>;
}
