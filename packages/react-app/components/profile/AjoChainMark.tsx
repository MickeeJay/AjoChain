import Image from "next/image";
import appIcon from "@/app/assets/android-chrome-192x192.png";

type AjoChainMarkProps = {
  className?: string;
};

export function AjoChainMark({ className }: AjoChainMarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Image src={appIcon} alt="AjoChain" width={24} height={24} className="h-6 w-6 rounded-lg" />
      <span className="text-xs font-semibold uppercase tracking-[0.16em]">AjoChain</span>
    </span>
  );
}
