import { mkdir, readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { Address } from "viem";

export const CONTRACTS_ROOT = resolve(process.cwd());
export const WORKSPACE_ROOT = resolve(CONTRACTS_ROOT, "..");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const CUSD_MAINNET_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as Address;
const CUSD_ALFAJORES_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" as Address;
const MIN_DEPLOYER_BALANCE = 100000000000000000n;

type NetworkId = 42220 | 44787;

type ContractAddressEntry = {
  factory: Address;
  cusd: Address;
};

export type SupportedNetworkName = "celo" | "alfajores";

export type NetworkConfig = {
  name: SupportedNetworkName;
  chainId: NetworkId;
  cUSDAddress: Address;
  deploymentFile: string;
  explorerBaseUrl: string;
};

export type DeploymentRecord = {
  network: SupportedNetworkName;
  chainId: NetworkId;
  deployedAt: string;
  deployer: Address;
  cUSD: Address;
  credential: Address;
  factory: Address;
  transactions: {
    credentialDeployment: string;
    factoryDeployment: string;
    ownershipTransfer: string;
  };
};

function parseAddressEntry(source: string, networkId: NetworkId): ContractAddressEntry | null {
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

function renderAddressLiteral(address: Address) {
  if (address.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
    return "ZERO_ADDRESS";
  }

  return `"${address}"`;
}

function renderAddressesFile(addresses: Record<NetworkId, ContractAddressEntry>) {
  return `import type { Address } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export const DEPLOYED_CONTRACT_ADDRESSES: Record<42220 | 44787, { factory: Address; cusd: Address }> = {
  42220: {
    factory: ${renderAddressLiteral(addresses[42220].factory)},
    cusd: ${renderAddressLiteral(addresses[42220].cusd)},
  },
  44787: {
    factory: ${renderAddressLiteral(addresses[44787].factory)},
    cusd: ${renderAddressLiteral(addresses[44787].cusd)},
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

function resolveDeploymentFile(networkName: SupportedNetworkName) {
  return resolve(CONTRACTS_ROOT, "deployments", `${networkName}.json`);
}

export function resolveNetworkConfig(networkName: string): NetworkConfig {
  switch (networkName) {
    case "celo":
      return {
        name: "celo",
        chainId: 42220,
        cUSDAddress: CUSD_MAINNET_ADDRESS,
        deploymentFile: resolveDeploymentFile("celo"),
        explorerBaseUrl: "https://celoscan.io",
      };
    case "alfajores":
      return {
        name: "alfajores",
        chainId: 44787,
        cUSDAddress: CUSD_ALFAJORES_ADDRESS,
        deploymentFile: resolveDeploymentFile("alfajores"),
        explorerBaseUrl: "https://alfajores.celoscan.io",
      };
    default:
      throw new Error(`Unsupported network: ${networkName}. Expected celo or alfajores.`);
  }
}

export function assertPrivateKey() {
  const privateKey = process.env.PRIVATE_KEY?.trim();

  if (!privateKey) {
    throw new Error("PRIVATE_KEY must be set before running deployment or smoke-test scripts.");
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error("PRIVATE_KEY must be a 32-byte hex value prefixed with 0x.");
  }

  return privateKey;
}

export function assertCeloScanApiKey() {
  const apiKey = process.env.CELOSCAN_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("CELOSCAN_API_KEY must be set before running contract verification.");
  }

  return apiKey;
}

export async function assertCorrectNetwork(hre: HardhatRuntimeEnvironment, expectedName: string) {
  const currentNetwork = await hre.ethers.provider.getNetwork();
  const config = resolveNetworkConfig(expectedName);

  if (BigInt(currentNetwork.chainId) !== BigInt(config.chainId)) {
    throw new Error(`Connected to chainId ${currentNetwork.chainId.toString()} but expected ${config.chainId} for ${expectedName}.`);
  }

  return config;
}

export async function getDeployerSigner(hre: HardhatRuntimeEnvironment) {
  const [deployer] = await hre.ethers.getSigners();

  if (!deployer) {
    throw new Error("No deployer signer is available from the configured PRIVATE_KEY.");
  }

  return {
    deployer,
    deployerAddress: await deployer.getAddress(),
  };
}

export async function ensureMinimumBalance(hre: HardhatRuntimeEnvironment, deployerAddress: string, minimumBalance = MIN_DEPLOYER_BALANCE) {
  const balance = await hre.ethers.provider.getBalance(deployerAddress);

  if (balance < minimumBalance) {
    throw new Error(
      `Deployer balance is too low: ${hre.ethers.formatEther(balance)} CELO. Fund the wallet with at least 0.1 CELO before retrying.`,
    );
  }

  return balance;
}

export function explorerAddressUrl(networkName: string, address: string) {
  return `${resolveNetworkConfig(networkName).explorerBaseUrl}/address/${address}`;
}

export function explorerTransactionUrl(networkName: string, transactionHash: string) {
  return `${resolveNetworkConfig(networkName).explorerBaseUrl}/tx/${transactionHash}`;
}

async function writeJson(filePath: string, data: unknown) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function writeDeploymentRecord(networkName: SupportedNetworkName, record: DeploymentRecord) {
  const config = resolveNetworkConfig(networkName);
  await writeJson(config.deploymentFile, record);
}

export async function readDeploymentRecord(networkName: SupportedNetworkName) {
  const config = resolveNetworkConfig(networkName);
  const source = await readFile(config.deploymentFile, "utf8");
  return JSON.parse(source) as DeploymentRecord;
}

export async function updateFrontendAddresses(networkName: SupportedNetworkName, factoryAddress: Address, cusdAddress: Address) {
  const config = resolveNetworkConfig(networkName);
  const frontendAddressesFile = resolve(WORKSPACE_ROOT, "packages/react-app/lib/contracts/addresses.ts");

  let existingSource = "";
  try {
    existingSource = await readFile(frontendAddressesFile, "utf8");
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
    42220: parseAddressEntry(existingSource, 42220) ?? defaultAddresses[42220],
    44787: parseAddressEntry(existingSource, 44787) ?? defaultAddresses[44787],
  };

  deployedAddresses[config.chainId] = {
    factory: factoryAddress,
    cusd: cusdAddress,
  };

  await writeFile(frontendAddressesFile, renderAddressesFile(deployedAddresses), "utf8");
}
