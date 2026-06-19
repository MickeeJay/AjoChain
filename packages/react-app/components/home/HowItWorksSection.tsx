"use client";

import { Users, Coins, Wallet, Award } from "lucide-react";

const STEPS = [
  {
    icon: Users,
    title: "Create or Join",
    description: "Start a new savings group with friends, or join one using an invite code.",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  {
    icon: Coins,
    title: "Contribute",
    description: "Everyone pays their share each round — automatically tracked, no manual bookkeeping.",
    color: "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300",
  },
  {
    icon: Wallet,
    title: "Receive Payouts",
    description: "Take turns receiving the full pot directly to your wallet. Fair order, no disputes.",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  },
  {
    icon: Award,
    title: "Earn Your Certificate",
    description: "Complete the cycle and get a permanent digital certificate proving your reliability.",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
];

export function HowItWorksSection() {
  return (
    <section className="space-y-5">
      <div className="text-center sm:text-left">
        <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
          How it works
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Four simple steps to start saving with your community.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className={`animate-slide-up rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950/80`}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Step {index + 1}
                  </p>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
