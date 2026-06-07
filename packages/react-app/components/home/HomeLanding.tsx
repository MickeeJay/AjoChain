"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { 
  ShieldCheck, 
  AlertCircle, 
  Coins, 
  Users, 
  Award, 
  ArrowRight, 
  Play, 
  RefreshCw, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Fingerprint
} from "lucide-react";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";
import { AuthErrorBanner } from "@/components/shared/AuthErrorBanner";
import { AuthStatusPill } from "@/components/shared/AuthStatusPill";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import appIcon from "@/app/assets/android-chrome-192x192.png";

type HomeLandingProps = {
  isMiniPay: boolean;
};

const SIMULATION_STEPS = [
  {
    title: "1. Create & Shuffle",
    description: "Alice, Bob, and You form a group contributing 10 cUSD. The blockchain shuffles the payout order: Alice gets Round 1, Bob Round 2, You Round 3.",
    actionText: "Start Savings Round 1",
  },
  {
    title: "2. Round 1 Payout",
    description: "Everyone contributes 10 cUSD (Total: 30 cUSD). The smart contract automatically transfers the full 30 cUSD pot to Alice.",
    actionText: "Advance to Round 2",
  },
  {
    title: "3. Round 2 Payout",
    description: "Everyone contributes another 10 cUSD. The contract automatically pays 30 cUSD to Bob. No coordinator delay or disputes.",
    actionText: "Advance to Round 3",
  },
  {
    title: "4. Round 3 (Your Turn)",
    description: "Everyone contributes 10 cUSD. You receive the 30 cUSD payout pot directly to your wallet.",
    actionText: "Finish & Mint Credential",
  },
  {
    title: "5. Cycle Complete!",
    description: "All rounds settled. Everyone gets their initial capital back in payouts. Each member earns an on-chain Credential to build credit history.",
    actionText: "Reset Simulation",
  }
];

export function HomeLanding({ isMiniPay }: HomeLandingProps) {
  const { status, isSignedIn, userLabel, userImage } = useAuthStatus();
  const [simStep, setSimStep] = useState(0);

  const nextSimStep = () => {
    setSimStep((current) => (current + 1) % SIMULATION_STEPS.length);
  };

  return (
    <section className="space-y-4 text-slate-900 dark:text-slate-100">
      <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-lime-50 to-white p-5 sm:p-6 shadow-[0_20px_60px_rgba(7,149,95,0.14)] dark:border-emerald-500/20 dark:from-emerald-900/40 dark:via-emerald-950/40 dark:to-slate-950">
        <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-emerald-200/50 blur-2xl dark:bg-emerald-500/20" aria-hidden="true" />
        <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-lime-200/40 blur-2xl dark:bg-lime-500/20" aria-hidden="true" />

        <div className="relative space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-emerald-200/60 dark:bg-slate-900/80 dark:ring-emerald-500/30">
              <Image src={appIcon} alt="AjoChain" width={32} height={32} className="h-8 w-8 rounded-xl" priority />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-200">AjoChain</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
            <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 dark:border-emerald-500/40 dark:bg-emerald-500/20">Celo</span>
            <span className="rounded-full border border-lime-300 bg-lime-100 px-3 py-1 dark:border-lime-400/40 dark:bg-lime-500/20">MiniPay</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-100">
            Community savings, secured by code.
          </h1>

          <p className="max-w-[38ch] text-sm leading-6 text-slate-600 dark:text-slate-300">
            Save together in rotating circles with cUSD contributions, automated payouts, and on-chain receipts anyone can verify.
          </p>

          <AuthErrorBanner />

          <div className="grid gap-3 w-full sm:max-w-[320px]">
            {status !== "loading" && isSignedIn ? (
              <AuthStatusPill
                className="border-emerald-200 bg-white/80 dark:border-emerald-500/30 dark:bg-slate-900/80"
                userLabel={userLabel}
                userImage={userImage}
              />
            ) : (
              <GoogleSignInButton fullWidth label="Continue with Google" />
            )}
            <ConnectWalletButton isMiniPay={isMiniPay} fullWidth />
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <p>
                <strong className="font-semibold text-slate-600 dark:text-slate-300">Connect wallet</strong> — links your MiniPay or crypto wallet to send and receive funds in your savings group.
              </p>
              <p>
                <strong className="font-semibold text-slate-600 dark:text-slate-300">Continue with Google</strong> — lets you browse groups and profiles without a wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
