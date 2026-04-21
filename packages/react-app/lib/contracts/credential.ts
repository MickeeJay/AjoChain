import type { CredentialMetadataAttribute, CredentialTokenMetadata } from "@/types";

const JSON_DATA_URI_PREFIX = "data:application/json;base64,";

function decodeBase64(base64Payload: string) {
  if (typeof atob === "function") {
    const binary = atob(base64Payload);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  return Buffer.from(base64Payload, "base64").toString("utf8");
}

export function decodeCredentialTokenUri(tokenUri: string): CredentialTokenMetadata {
  if (!tokenUri.startsWith(JSON_DATA_URI_PREFIX)) {
    throw new Error("Unsupported credential tokenURI format.");
  }

  const encodedMetadata = tokenUri.slice(JSON_DATA_URI_PREFIX.length);
  const decoded = decodeBase64(encodedMetadata);

  return JSON.parse(decoded) as CredentialTokenMetadata;
}

export function findMetadataAttribute(metadata: CredentialTokenMetadata, trait: string): CredentialMetadataAttribute | undefined {
  return metadata.attributes?.find((attribute) => attribute.trait_type === trait);
}

export function readNumericAttribute(metadata: CredentialTokenMetadata, trait: string): bigint | null {
  const attribute = findMetadataAttribute(metadata, trait);

  if (!attribute) {
    return null;
  }

  const numeric = Number(attribute.value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return BigInt(Math.trunc(numeric));
}

export function readTextAttribute(metadata: CredentialTokenMetadata, trait: string): string | null {
  const attribute = findMetadataAttribute(metadata, trait);

  if (!attribute) {
    return null;
  }

  return String(attribute.value);
}
