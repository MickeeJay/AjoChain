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
import { SocialLoginGroup } from "@/components/shared/SocialLoginGroup";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import appIcon from "@/app/assets/android-chrome-192x192.png";
import { HowItWorksSection } from "./HowItWorksSection";

type HomeLandingProps = {
  isMiniPay: boolean;
};

const SIMULATION_STEPS = [
  {
    title: "1. Form a Group",
    description: "Alice, Bob, and You start a savings group. Each person will contribute 10 cUSD per round. The app fairly picks who gets paid first.",
    actionText: "Start Round 1",
  },
  {
    title: "2. Alice Gets Paid",
    description: "Everyone puts in 10 cUSD. The full 30 cUSD pot goes straight to Alice’s wallet — automatically, no delays.",
    actionText: "Go to Round 2",
  },
  {
    title: "3. Bob Gets Paid",
    description: "Everyone contributes again. Bob receives the 30 cUSD pot. No arguments, no coordinator needed.",
    actionText: "Go to Round 3",
  },
  {
    title: "4. Your Turn!",
    description: "Everyone contributes one last time. You receive 30 cUSD directly to your wallet.",
    actionText: "Earn Savings Certificate",
  },
  {
    title: "5. Cycle Complete!",
    description: "Everyone got their money back through payouts. Each member earns a permanent savings certificate to prove their reliability.",
    actionText: "Restart Demo",
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
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-lime-50/30 to-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(7,149,95,0.12)] dark:border-emerald-500/20 dark:from-emerald-950/40 dark:via-slate-950 dark:to-slate-950 animate-slide-up">
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
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Group Savings App</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <span className="rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 flex items-center gap-1.5 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Live on Celo
              </span>
              <span className="rounded-full border border-emerald-300 bg-emerald-100/80 px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 flex items-center gap-1.5 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MiniPay Miniapp Ready
              </span>
            </div>

          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-slate-100">
              Your group savings, protected by code — not promises.
            </h1>
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-350">
              AjoChain replaces the organizer notebook with automatic rules. No one can run away with the money. Everyone can see every payment. Every completed cycle builds your savings reputation.
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
                <SocialLoginGroup callbackUrl="/" />
              )}
              <ConnectWalletButton isMiniPay={isMiniPay} fullWidth />
            </div>

            <div className="flex flex-col justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:pl-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p><strong>Free to explore</strong> — no sign-up needed to browse groups and learn how it works.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                <p><strong>Dollar-value savings</strong> using cUSD, with support for local currencies like cKES, cNGN, and cGHS.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="animate-slide-up delay-100">
        <HowItWorksSection />
      </div>

      {/* The Problem & Solution Section */}
      <section className="space-y-4 animate-slide-up delay-200">
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">How AjoChain protects your group savings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">See what changes when your savings group runs on AjoChain.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Traditional Way */}
          <article className="rounded-2xl border border-rose-100 bg-rose-50/20 p-5 dark:border-rose-950/20 dark:bg-rose-950/5">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-bold">Without AjoChain</h3>
            </div>
            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <li className="flex gap-2">
                <span className="font-semibold text-rose-500">✕</span>
                <span><strong>Organizer can disappear</strong> with the entire savings pot.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-rose-500">✕</span>
                <span><strong>Paper records get lost</strong> and WhatsApp chats cause disputes.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-rose-500">✕</span>
                <span><strong>Arguments over payout order</strong> — who gets the pot first?</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-rose-500">✕</span>
                <span><strong>No proof you saved</strong> — banks never see your track record.</span>
              </li>
            </ul>
          </article>

          {/* AjoChain Way */}
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/10 p-5 dark:border-emerald-950/20 dark:bg-emerald-950/5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-bold">With AjoChain</h3>
            </div>
            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <li className="flex gap-2">
                <span className="font-semibold text-emerald-500">✓</span>
                <span><strong>Funds are locked in code</strong> — no one person can steal them.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-emerald-500">✓</span>
                <span><strong>Every payment is visible</strong> — anyone can check the record anytime.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-emerald-500">✓</span>
                <span><strong>Fair random payout order</strong> — the app decides, no one can jump the queue.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-emerald-500">✓</span>
                <span><strong>Earn a savings certificate</strong> — prove your reliability to lenders and partners.</span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      {/* Interactive Savings Simulation Widget */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-[0_16px_40px_rgba(16,42,44,0.06)] dark:border-slate-800 dark:bg-slate-950/90 space-y-5 animate-slide-up delay-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              See how it works in 30 seconds
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Walk through a complete savings cycle with three members.</p>
          </div>
          <button
            onClick={() => setSimStep(0)}
            className="flex items-center gap-1.5 self-start text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Demo
          </button>
        </div>

        {/* Simulator Visualization */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-900 grid gap-6 md:grid-cols-[1fr_1.2fr] items-center">
          
          {/* Visual Diagram */}
          <div className="flex flex-col items-center justify-center p-3 relative min-h-[190px]">
            {/* Center Pot */}
            <div className="h-16 w-16 rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center shadow-lg border border-emerald-500 z-10 transition-transform duration-500">
              <Coins className="h-5 w-5 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase mt-0.5">
                {simStep === 0 ? "0 cUSD" : "30 cUSD"}
              </span>
            </div>
            
            {/* Members Circles */}
            <div className="absolute top-2 flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm border transition-all duration-300 ${simStep === 1 ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-110' : 'bg-white border-slate-200 text-slate-700'}`}>
                A
              </div>
              <span className="text-[10px] font-semibold mt-1">Alice</span>
              <span className="text-[9px] text-slate-500">
                {simStep === 0 ? "Pays $10" : simStep === 1 ? "+$30 Paid!" : "Settled"}
              </span>
            </div>

            <div className="absolute bottom-2 left-6 flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm border transition-all duration-300 ${simStep === 2 ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-110' : 'bg-white border-slate-200 text-slate-700'}`}>
                B
              </div>
              <span className="text-[10px] font-semibold mt-1">Bob</span>
              <span className="text-[9px] text-slate-500">
                {simStep === 0 ? "Pays $10" : simStep === 2 ? "+$30 Paid!" : "Settled"}
              </span>
            </div>

            <div className="absolute bottom-2 right-6 flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm border transition-all duration-300 ${simStep === 3 ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-110 border-2' : simStep === 4 ? 'bg-amber-100 border-amber-500 text-amber-800 scale-110' : 'bg-white border-slate-200 text-slate-700'}`}>
                You
              </div>
              <span className="text-[10px] font-semibold mt-1">You</span>
              <span className="text-[9px] text-slate-500">
                {simStep === 0 ? "Pays $10" : simStep === 3 ? "+$30 Paid!" : simStep === 4 ? "Earned Cert!" : "Settled"}
              </span>
            </div>
          </div>

          {/* Explanation text */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ChevronRight className="h-4 w-4 text-emerald-600" />
                {SIMULATION_STEPS[simStep].title}
              </h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350 min-h-[60px]">
                {SIMULATION_STEPS[simStep].description}
              </p>
            </div>

            {/* Stepper controls */}
            <button
              onClick={nextSimStep}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 w-full justify-center"
            >
              {simStep === 4 ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {SIMULATION_STEPS[simStep].actionText}
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {SIMULATION_STEPS[simStep].actionText}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-1.5">
          {SIMULATION_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setSimStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${simStep === index ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Exploration Links */}
      <section className="grid gap-4 sm:grid-cols-2 animate-slide-up delay-500">
        <Link
          href="/groups"
          className="group block p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-950/80"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">Find a Savings Group</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Browse forming groups or start a new one using our templates.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/profile?demo=true"
          className="group block p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-950/80"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">See a Demo Profile</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Check out how completed cycles build your savings reputation.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition group-hover:translate-x-1" />
          </div>
        </Link>
      </section>

      {/* On-Chain Security Features */}
      <section className="bg-slate-950 text-white rounded-3xl p-6 relative overflow-hidden dark:bg-slate-900 animate-slide-up delay-500">
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
        <h3 className="font-bold text-sm uppercase tracking-widest text-emerald-400">Your money stays safe</h3>
        <p className="mt-2 text-xl font-bold tracking-tight">Every protection is built into the app.</p>
        
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <Fingerprint className="h-6 w-6 text-emerald-400" />
            <h4 className="mt-2.5 text-xs font-bold uppercase tracking-wider">Dollar-Value Savings</h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">Your savings are in cUSD — a digital dollar. No more worrying about naira or shilling losing value.</p>
          </div>
          <div>
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h4 className="mt-2.5 text-xs font-bold uppercase tracking-wider">Savings Certificate</h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">Complete a cycle and earn a permanent certificate that proves you&apos;re a reliable saver. Share it with lenders.</p>
          </div>
          <div>
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            <h4 className="mt-2.5 text-xs font-bold uppercase tracking-wider">Fair Payout Order</h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">The app decides who gets paid first using a fair, random system. No one can jump the queue.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
