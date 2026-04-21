import type { ReactNode } from "react";
import { WalletGuard } from "@/components/shared/WalletGuard";
import { BottomNav } from "./BottomNav";
import { ShellHeader } from "./ShellHeader";
import { MINIPAY_VIEWPORT_HEIGHT_PX, SHELL_HEADER_OFFSET_CLASS, SHELL_MAIN_BOTTOM_PADDING_CLASS, SHELL_MAX_WIDTH_PX } from "./shell.constants";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full flex-col overflow-hidden bg-white text-gray-900"
      style={{ maxWidth: SHELL_MAX_WIDTH_PX, minHeight: `max(100dvh, ${MINIPAY_VIEWPORT_HEIGHT_PX}px)` }}
    >
      <ShellHeader />
      <main className={`flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 ${SHELL_HEADER_OFFSET_CLASS} ${SHELL_MAIN_BOTTOM_PADDING_CLASS}`}>
        <WalletGuard>{children}</WalletGuard>
      </main>
      <BottomNav />
    </div>
  );
}
