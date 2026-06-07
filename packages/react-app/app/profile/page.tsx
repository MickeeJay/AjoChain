"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { type Address } from "viem";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { CredentialsSection } from "@/components/profile/CredentialsSection";
import { ProfileAuthPanel } from "@/components/profile/ProfileAuthPanel";
import { NetworkMismatchNotice } from "@/components/shared/NetworkMismatchNotice";
import { ProfileIdentityHeader } from "@/components/profile/ProfileIdentityHeader";
import { ProfileShareActions } from "@/components/profile/ProfileShareActions";
import { ProfileStatsRow } from "@/components/profile/ProfileStatsRow";
import { ReputationPanel } from "@/components/profile/ReputationPanel";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useOptionalEnsName } from "@/hooks/useOptionalEnsName";
import { useUserCredentials } from "@/hooks/useUserCredentials";
import { formatCusdCurrency } from "@/lib/profile";
import { shortenAddress } from "@/lib/utils";

// Mock credentials for demo/preview mode
const MOCK_CREDENTIALS = [
  {
    tokenId: 102n,
    recipient: "0x70A8C3AbF529B26dB520a12ea63276cceb50bB30" as Address,
    groupContract: "0xAb672F162220ebB17B82bBcf8823Cd0f141515b9" as Address,
    groupName: "Weekly Market Traders Pot",
    cyclesCompleted: 1n,
    totalSaved: 50000000000000000000n, // 50 cUSD
    completedAt: 1716812800n, // Mock date
  },
  {
    tokenId: 84n,
    recipient: "0x70A8C3AbF529B26dB520a12ea63276cceb50bB30" as Address,
    groupContract: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as Address,
    groupName: "Daily Cooperative Circle",
    cyclesCompleted: 2n,
    totalSaved: 75000000000000000000n, // 75 cUSD
    completedAt: 1714812800n,
  },
  {
    tokenId: 41n,
    recipient: "0x70A8C3AbF529B26dB520a12ea63276cceb50bB30" as Address,
    groupContract: "0x70A8C3AbF529B26dB520a12ea63276cceb50bB30" as Address,
    groupName: "Monthly Growth Club",
    cyclesCompleted: 1n,
    totalSaved: 100000000000000000000n, // 100 cUSD
    completedAt: 1711812800n,
  }
];

function ProfilePageContent() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const isDemoMode = !address || searchParams.get("demo") === "true";
  const { ensName } = useOptionalEnsName(address as Address | undefined);
  const { userGroups, activeGroupCount, totalSaved, cyclesCompleted, isGroupsLoading, isCyclesLoading } = useDashboardData();
  const { credentials, isLoading: isCredentialsLoading } = useUserCredentials();

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [sharingTokenId, setSharingTokenId] = useState<bigint | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // Compute values based on whether we are in demo mode or real mode
  const displayAddress = isDemoMode
    ? ("0x70A8C3AbF529B26dB520a12ea63276cceb50bB30" as Address)
    : (address as Address);

  const displayEns = isDemoMode ? "demo.ajochain.eth" : ensName;
  const displayCycles = isDemoMode ? 4n : cyclesCompleted;
  const displayTotalSaved = isDemoMode ? 225000000000000000000n : totalSaved; // 225 cUSD total
  const displayGroupsCompleted = isDemoMode
    ? 3
    : userGroups.filter((group) => group.status === "COMPLETED").length;
  const displayActiveGroupsCount = isDemoMode ? 1 : activeGroupCount;
  const displayCredentials = isDemoMode ? MOCK_CREDENTIALS : credentials;

  const addressLabel = useMemo(() => {
    if (isDemoMode) {
      return `${shortenAddress(displayAddress)} (Demo Mode)`;
    }
    return address ? shortenAddress(address) : "No wallet connected";
  }, [address, displayAddress, isDemoMode]);

  const profileUrl = useMemo(() => {
    if (!baseUrl || !displayAddress) {
      return "";
    }
    return `${baseUrl}/profile?address=${displayAddress}`;
  }, [displayAddress, baseUrl]);

  const latestCredentialLink = useMemo(() => {
    if (!baseUrl || displayCredentials.length === 0) {
      return profileUrl;
    }
    return `${baseUrl}/credentials/${displayCredentials[0].tokenId.toString()}`;
  }, [baseUrl, displayCredentials, profileUrl]);

  const whatsappMessage = useMemo(() => {
    const saved = formatCusdCurrency(displayTotalSaved);
    const link = latestCredentialLink || profileUrl || "https://ajochain.app";
    return `I completed a savings cycle on AjoChain! Total saved: ${saved}. Verify: ${link}`;
  }, [latestCredentialLink, profileUrl, displayTotalSaved]);

  const whatsappHref = useMemo(() => `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, [whatsappMessage]);

  const copyToClipboard = async (value: string) => {
    if (!value) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyAddress = () => {
    if (!displayAddress) {
      return;
    }

    void copyToClipboard(displayAddress).then((success) => {
      if (!success) {
        return;
      }

      setCopiedAddress(true);
      window.setTimeout(() => setCopiedAddress(false), 1500);
    });
  };

  const handleCopyProfile = () => {
    if (!profileUrl) {
      return;
    }

    void copyToClipboard(profileUrl).then((success) => {
      if (!success) {
        return;
      }

      setCopiedProfile(true);
      window.setTimeout(() => setCopiedProfile(false), 1500);
    });
  };

  const handleShareCredential = (tokenId: bigint) => {
    if (!baseUrl) {
      return;
    }

    const credentialLink = `${baseUrl}/credentials/${tokenId.toString()}`;
    void copyToClipboard(credentialLink).then((success) => {
      if (!success) {
        return;
      }

      setSharingTokenId(tokenId);
      window.setTimeout(() => setSharingTokenId(null), 1700);
    });
  };

  return (
    <section className="flex flex-col gap-4 text-slate-900 dark:text-slate-100">
      <NetworkMismatchNotice />

      {isDemoMode ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 flex items-center gap-2 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Viewing in Demo Preview Mode. Connect a wallet to view your own on-chain savings score and achievements.</span>
        </div>
      ) : null}
      <ProfileIdentityHeader
        addressLabel={addressLabel}
        ensName={displayEns}
        onCopyAddress={handleCopyAddress}
        copied={copiedAddress}
      />
      <ProfileAuthPanel />

      <ReputationPanel score={displayCycles} loading={!isDemoMode && isCyclesLoading} />

      <ProfileStatsRow
        totalSaved={displayTotalSaved}
        groupsCompleted={displayGroupsCompleted}
        activeGroups={displayActiveGroupsCount}
        loading={!isDemoMode && isGroupsLoading}
      />

      <ProfileShareActions onCopyProfile={handleCopyProfile} copiedProfile={copiedProfile} whatsappHref={whatsappHref} />

      <CredentialsSection
        credentials={displayCredentials}
        isLoading={!isDemoMode && isCredentialsLoading}
        sharingTokenId={sharingTokenId}
        onShare={handleShareCredential}
      />

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Reputation reflects on-chain savings completions and can be queried by partners for creditworthiness.
      </p>
    </section>
  );
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}