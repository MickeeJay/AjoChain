"use client";

import { useEffect, useMemo, useState } from "react";
import { type Address } from "viem";
import { useAccount } from "wagmi";
import { CredentialsSection } from "@/components/profile/CredentialsSection";
import { ProfileIdentityHeader } from "@/components/profile/ProfileIdentityHeader";
import { ProfileShareActions } from "@/components/profile/ProfileShareActions";
import { ProfileStatsRow } from "@/components/profile/ProfileStatsRow";
import { ReputationPanel } from "@/components/profile/ReputationPanel";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useOptionalEnsName } from "@/hooks/useOptionalEnsName";
import { useUserCredentials } from "@/hooks/useUserCredentials";
import { formatCusdCurrency } from "@/lib/profile";
import { shortenAddress } from "@/lib/utils";

export default function ProfilePage() {
  const { address } = useAccount();
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

  const groupsCompleted = useMemo(() => userGroups.filter((group) => group.status === "COMPLETED").length, [userGroups]);

  const addressLabel = useMemo(() => (address ? shortenAddress(address) : "No wallet connected"), [address]);

  const profileUrl = useMemo(() => {
    if (!baseUrl || !address) {
      return "";
    }

    return `${baseUrl}/profile?address=${address}`;
  }, [address, baseUrl]);

  const latestCredentialLink = useMemo(() => {
    if (!baseUrl || credentials.length === 0) {
      return profileUrl;
    }

    return `${baseUrl}/credentials/${credentials[0].tokenId.toString()}`;
  }, [baseUrl, credentials, profileUrl]);

  const whatsappMessage = useMemo(() => {
    const saved = formatCusdCurrency(totalSaved);
    const link = latestCredentialLink || profileUrl || "https://ajochain.app";
    return `I completed a savings cycle on AjoChain! Total saved: ${saved}. Verify: ${link}`;
  }, [latestCredentialLink, profileUrl, totalSaved]);

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
    if (!address) {
      return;
    }

    void copyToClipboard(address).then((success) => {
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
    <section className="flex flex-col gap-4 text-slate-900">
      <ProfileIdentityHeader addressLabel={addressLabel} ensName={ensName} onCopyAddress={handleCopyAddress} copied={copiedAddress} />

      <ReputationPanel score={cyclesCompleted} loading={isCyclesLoading} />

      <ProfileStatsRow
        totalSaved={totalSaved}
        groupsCompleted={groupsCompleted}
        activeGroups={activeGroupCount}
        loading={isGroupsLoading}
      />

      <ProfileShareActions onCopyProfile={handleCopyProfile} copiedProfile={copiedProfile} whatsappHref={whatsappHref} />

      <CredentialsSection
        credentials={credentials}
        isLoading={isCredentialsLoading}
        sharingTokenId={sharingTokenId}
        onShare={handleShareCredential}
      />

      <p className="text-xs text-slate-500">
        Reputation reflects on-chain savings completions and can be queried by partners for creditworthiness.
      </p>
    </section>
  );
}