import Link from "next/link";
import { Home, PlusCircle, UsersRound } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create", icon: PlusCircle },
  { href: "/groups", label: "Groups", icon: UsersRound },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-950 hover:text-white"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
