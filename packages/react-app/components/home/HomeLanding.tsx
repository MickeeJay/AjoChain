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
    <section className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-lime-50/30 to-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(7,149,95,0.12)] dark:border-emerald-500/20 dark:from-emerald-950/40 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-500/10" aria-hidden="true" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-lime-300/30 blur-3xl dark:bg-lime-500/10" aria-hidden="true" />

        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 shadow-sm ring-1 ring-emerald-100 dark:bg-slate-900/95 dark:ring-emerald-500/30">
                <Image src={appIcon} alt="AjoChain" width={32} height={32} className="h-8 w-8 rounded-xl" priority />
              </div>
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">AjoChain</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Rotating Savings Circle Protocol</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full border border-emerald-300 bg-emerald-100/80 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300">Celo</span>
              <span className="rounded-full border border-lime-300 bg-lime-100/80 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-lime-800 dark:border-lime-400/30 dark:bg-lime-500/20 dark:text-lime-300">MiniPay</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-slate-100">
              Grow savings safely with your community.
            </h1>
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-350">
              Traditional rotating savings groups (Ajo, Chama, Esusu) secured by smart contracts. Save together, prevent fraud, and build an on-chain credit reputation automatically.
            </p>
          </div>

          <AuthErrorBanner />

          {/* Quick CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="grid gap-3 w-full sm:max-w-[320px]">
              {status !== "loading" && isSignedIn ? (
                <AuthStatusPill
                  className="border-emerald-200 bg-white/90 dark:border-emerald-500/30 dark:bg-slate-900/90"
                  userLabel={userLabel}
                  userImage={userImage}
                />
              ) : (
                <GoogleSignInButton fullWidth label="Continue with Google" />
              )}
              <ConnectWalletButton isMiniPay={isMiniPay} fullWidth />
            </div>

            <div className="flex flex-col justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:pl-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p><strong>Preview Mode</strong> is active: browse groups and templates without a wallet.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                <p><strong>Digital Stablecoin</strong> contributions using cUSD.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
