import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PublicCredentialView } from "@/components/profile/PublicCredentialView";
import { fetchPublicCredential, getCredentialExplorerTokenUrl } from "@/lib/contracts/publicCredential";
import { formatCredentialCompletionDate, formatCusdCurrency } from "@/lib/profile";

type CredentialPageProps = {
  params: {
    tokenId: string;
  };
};

const getCredential = cache(async (tokenIdRaw: string) => {
  if (!/^\d+$/.test(tokenIdRaw)) {
    return null;
  }

  return fetchPublicCredential(BigInt(tokenIdRaw));
});

export async function generateMetadata({ params }: CredentialPageProps): Promise<Metadata> {
  const credential = await getCredential(params.tokenId);

  if (!credential) {
    return {
      title: "Credential Not Found | AjoChain",
      description: "This AjoChain credential could not be found on-chain.",
    };
  }

  const savedAmount = formatCusdCurrency(credential.totalSaved);
  const completedDate = formatCredentialCompletionDate(credential.completedAt);
  const description = `${credential.groupName}: ${credential.cyclesCompleted.toString()} cycles completed, total saved ${savedAmount}, completed on ${completedDate}.`;
  const image = credential.metadata.image;

  return {
    title: `${credential.groupName} Credential | AjoChain`,
    description,
    openGraph: {
      title: `${credential.groupName} Credential | AjoChain`,
      description,
      type: "website",
      url: `/credentials/${params.tokenId}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${credential.groupName} Credential | AjoChain`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CredentialPage({ params }: CredentialPageProps) {
  const credential = await getCredential(params.tokenId);

  if (!credential) {
    notFound();
  }

  const verifyUrl = getCredentialExplorerTokenUrl(credential.chainId, credential.credentialAddress, credential.tokenId);

  return <PublicCredentialView credential={credential} verifyUrl={verifyUrl} />;
}
