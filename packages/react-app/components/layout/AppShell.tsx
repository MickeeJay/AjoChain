import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ShellHeader } from "./ShellHeader";
import { SHELL_HEADER_OFFSET_CLASS, SHELL_MAIN_BOTTOM_PADDING_CLASS } from "./shell.constants";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white text-gray-900">
      <ShellHeader />
      <main className={`flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 ${SHELL_HEADER_OFFSET_CLASS} ${SHELL_MAIN_BOTTOM_PADDING_CLASS}`}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
