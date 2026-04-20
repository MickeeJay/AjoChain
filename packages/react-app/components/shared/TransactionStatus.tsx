"use client";

import { useEffect } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { TransactionStatusItem } from "@/types";
import { getCeloscanTxUrl } from "@/lib/transactions";

type LegacyTransactionStatusProps = {
  mode?: "inline";
  status: "idle" | "pending" | "success" | "error";
  label: string;
};

type DrawerTransactionStatusProps = {
  mode: "drawer";
  open: boolean;
  item: TransactionStatusItem | null;
  onClose?: () => void;
};

type TransactionStatusProps = LegacyTransactionStatusProps | DrawerTransactionStatusProps;

const legacyStyles: Record<LegacyTransactionStatusProps["status"], string> = {
  idle: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  success: "bg-emerald-100 text-emerald-800",
  error: "bg-rose-100 text-rose-800",
};

function DrawerStateIcon({ state }: { state: TransactionStatusItem["state"] }) {
  if (state === "success") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />;
  }

  if (state === "failed") {
    return <XCircle className="h-5 w-5 text-rose-600" aria-hidden="true" />;
  }

  return <Loader2 className="h-5 w-5 animate-spin text-amber-600" aria-hidden="true" />;
}

export function TransactionStatus(props: TransactionStatusProps) {
  const isDrawerMode = props.mode === "drawer";
  const drawerOpen = isDrawerMode ? props.open : false;
  const drawerItem = isDrawerMode ? props.item : null;
  const drawerOnClose = isDrawerMode ? props.onClose : undefined;

  useEffect(() => {
    if (!drawerOpen || !drawerItem || drawerItem.state !== "success" || !drawerOnClose) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      drawerOnClose();
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [drawerItem, drawerOnClose, drawerOpen]);

  if (isDrawerMode) {
    const { open, item, onClose } = props;

    if (!open || !item) {
      return null;
    }

    const confirmations = item.confirmations ?? 0;
    const requiredConfirmations = item.requiredConfirmations ?? 2;
    const txUrl = getCeloscanTxUrl(item.txHash);

    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4 sm:bottom-5">
        <div className="pointer-events-auto w-full max-w-md animate-[slide-up_220ms_ease-out] rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_-10px_60px_rgba(15,23,42,0.2)]">
          <div className="flex items-start gap-3">
            <DrawerStateIcon state={item.state} />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              {item.state === "pending" ? <p className="text-xs text-slate-500">Transaction submitted and waiting to be mined.</p> : null}
              {item.state === "confirming" ? (
                <p className="text-xs text-slate-500">
                  {Math.min(confirmations, requiredConfirmations)} of {requiredConfirmations} confirmations
                </p>
              ) : null}
              {item.state === "failed" && item.errorMessage ? <p className="text-xs text-rose-600">{item.errorMessage}</p> : null}
              {txUrl ? (
                <a
                  href={txUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs font-semibold text-celo-green underline-offset-2 hover:underline"
                >
                  View on Celoscan
                </a>
              ) : null}
            </div>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const { label, status } = props;

  return <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${legacyStyles[status]}`}>{label}</span>;
}
