"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SHELL_BOTTOM_NAV_HEIGHT_PX, SHELL_MAX_WIDTH_PX } from "./shell.constants";

const items = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/create", label: "Create", icon: PlusCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto w-full px-3 pb-safe-bottom" style={{ maxWidth: SHELL_MAX_WIDTH_PX }}>
        <div className="grid grid-cols-4 gap-1" style={{ height: SHELL_BOTTOM_NAV_HEIGHT_PX }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-[11px] font-medium transition-colors",
                active
                  ? "text-[#35D07F]"
                  : "text-[#9CA3AF] hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-900/70 dark:hover:text-slate-200",
              )}
            >
              {active ? (
                <span className="mb-0.5 h-1 w-1 rounded-full bg-[#35D07F]" aria-hidden="true" />
              ) : null}
              <Icon
                className={cn("h-5 w-5", active ? "text-[#35D07F]" : "text-[#9CA3AF] dark:text-slate-500")}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}

