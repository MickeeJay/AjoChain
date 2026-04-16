import { readFile, writeFile } from "fs/promises";
import hre from "hardhat";
import { resolve } from "path";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { Address } from "viem";

type NetworkId = 42220 | 44787;

type ContractAddressEntry = {
  factory: Address;
  cusd: Address;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const CUSD_MAINNET_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as Address;
const CUSD_ALFAJORES_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" as Address;
const FRONTEND_ADDRESSES_FILE = resolve(process.cwd(), "../packages/react-app/lib/contracts/addresses.ts");

function resolveNetworkId(networkName: string): NetworkId | null {
  switch (networkName) {
    case "celo":
      return 42220;
    case "alfajores":
      return 44787;
    default:
      return null;
  }
}

export function resolveCusdAddress(networkName: string): Address {
  switch (networkName) {
    case "celo":
      return CUSD_MAINNET_ADDRESS;
    case "alfajores":
      return CUSD_ALFAJORES_ADDRESS;
    default:
      return (process.env.LOCAL_CUSD_ADDRESS ?? ZERO_ADDRESS) as Address;
  }
}

function extractAddressEntry(source: string, networkId: NetworkId): ContractAddressEntry | null {
  const pattern = new RegExp(
    `${networkId}:\\s*\\{\\s*factory:\\s*"([^"]+)"(?:\\s+as\\s+Address)?,\\s*cusd:\\s*"([^"]+)"(?:\\s+as\\s+Address)?,\\s*\\}`,
    "s",
  );
  const match = source.match(pattern);

  if (!match) {
    return null;
  }

  return {
    factory: match[1] as Address,
    cusd: match[2] as Address,
  };
}

function renderAddressesFile(addresses: Record<NetworkId, ContractAddressEntry>) {
  return `import type { Address } from "viem";

export const DEPLOYED_CONTRACT_ADDRESSES: Record<42220 | 44787, { factory: Address; cusd: Address }> = {
  42220: {
    factory: "${addresses[42220].factory}",
    cusd: "${addresses[42220].cusd}",
  },
  44787: {
    factory: "${addresses[44787].factory}",
    cusd: "${addresses[44787].cusd}",
  },
};

export const CONTRACT_ADDRESSES: Record<42220 | 44787, { factory: Address; cusd: Address }> = {
  42220: {
    factory: (process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS ?? DEPLOYED_CONTRACT_ADDRESSES[42220].factory) as Address,
    cusd: (process.env.NEXT_PUBLIC_CUSD_ADDRESS ?? DEPLOYED_CONTRACT_ADDRESSES[42220].cusd) as Address,
  },
  44787: {
    factory: (process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS ?? DEPLOYED_CONTRACT_ADDRESSES[44787].factory) as Address,
    cusd: (process.env.NEXT_PUBLIC_CUSD_ALFAJORES ?? DEPLOYED_CONTRACT_ADDRESSES[44787].cusd) as Address,
  },
};

export function getContractAddresses(chainId: number) {
  const resolvedChainId = chainId === 42220 || chainId === 44787 ? chainId : 44787;
  return CONTRACT_ADDRESSES[resolvedChainId];
}
`;
}

async function exportFrontendAddresses(networkId: NetworkId, deployedAddress: Address, cusdAddress: Address) {
  let existingSource = "";

  try {
    existingSource = await readFile(FRONTEND_ADDRESSES_FILE, "utf8");
  } catch {
    existingSource = "";
  }

  const defaultAddresses: Record<NetworkId, ContractAddressEntry> = {
    42220: {
      factory: ZERO_ADDRESS,
      cusd: CUSD_MAINNET_ADDRESS,
    },
    44787: {
      factory: ZERO_ADDRESS,
      cusd: CUSD_ALFAJORES_ADDRESS,
    },
  };

  const deployedAddresses: Record<NetworkId, ContractAddressEntry> = {
    42220: extractAddressEntry(existingSource, 42220) ?? defaultAddresses[42220],
    44787: extractAddressEntry(existingSource, 44787) ?? defaultAddresses[44787],
  };

  deployedAddresses[networkId] = {
    factory: deployedAddress,
    cusd: cusdAddress,
  };

  await writeFile(FRONTEND_ADDRESSES_FILE, renderAddressesFile(deployedAddresses), "utf8");
}

export async function deployGroupFactory(hre: HardhatRuntimeEnvironment) {
  const networkId = resolveNetworkId(hre.network.name);
  const [deployerSigner] = await hre.ethers.getSigners();
  const deployerAddress = await deployerSigner.getAddress();
  const cusdAddress = resolveCusdAddress(hre.network.name);

  const factory = await hre.ethers.getContractFactory("AjoGroupFactory", deployerSigner);
  const contract = await factory.deploy(cusdAddress);
  await contract.waitForDeployment();

  const deploymentTransaction = contract.deploymentTransaction();
  if (deploymentTransaction) {
    await deploymentTransaction.wait(networkId === null ? 1 : 5);
  }

  const deployedAddress = (await contract.getAddress()) as Address;
  console.log(`AjoGroupFactory deployed to ${deployedAddress} on ${hre.network.name}`);
  console.log(`Using cUSD address ${cusdAddress}`);

  if (networkId !== null) {
    await exportFrontendAddresses(networkId, deployedAddress, cusdAddress);
  }

  if (networkId !== null) {
    await hre.run("verify:verify", {
      address: deployedAddress,
      constructorArguments: [cusdAddress],
    });
  }

  return {
    contract,
    deployedAddress,
    deployerAddress,
    cusdAddress,
  };
}

async function main() {
  await deployGroupFactory(hre);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}