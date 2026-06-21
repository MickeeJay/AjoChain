"use client";

import { PrivyLoginButton } from "./PrivyLoginButton";

type SocialLoginGroupProps = {
  className?: string;
  callbackUrl?: string; // Kept for compatibility, though Privy handles redirection/state internally
};

export function SocialLoginGroup({ className }: SocialLoginGroupProps) {
  return (
    <div className={className}>
      <PrivyLoginButton fullWidth label="Sign In with Email or Wallet" />
    </div>
  );
}
