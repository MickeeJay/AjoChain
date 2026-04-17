import { config as loadEnv } from "dotenv";
import hre from "hardhat";
import type { Address } from "viem";
import {
  assertCorrectNetwork,
  assertPrivateKey,
  ensureMinimumBalance,
  explorerAddressUrl,
  explorerTransactionUrl,
  getDeployerSigner,
  resolveNetworkConfig,
  updateFrontendAddresses,
  writeDeploymentRecord,
  type DeploymentRecord,
} from "./alfajores.js";

loadEnv();

const NETWORK_NAME = "alfajores";

async function waitForConfirmations(transaction: { hash: string; wait: (confirmations?: number) => Promise<unknown> }, confirmations = 5) {
  await transaction.wait(confirmations);
}

async function main() {
  assertPrivateKey();
  const networkConfig = await assertCorrectNetwork(hre, NETWORK_NAME);

  const { deployer, deployerAddress } = await getDeployerSigner(hre);
  const deployerBalance = await ensureMinimumBalance(hre, deployerAddress);

  console.log(`Connected to ${NETWORK_NAME} (${networkConfig.chainId}).`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Deployer balance: ${hre.ethers.formatEther(deployerBalance)} CELO`);

  const credentialFactory = await hre.ethers.getContractFactory("AjoCredential", deployer);
  const credentialContract = await credentialFactory.deploy();
  await credentialContract.waitForDeployment();

  const credentialDeploymentTransaction = credentialContract.deploymentTransaction();
  if (!credentialDeploymentTransaction) {
    throw new Error("AjoCredential deployment transaction is missing.");
  }

  await waitForConfirmations(credentialDeploymentTransaction, 5);

  const credentialAddress = (await credentialContract.getAddress()) as Address;
  console.log(`AjoCredential deployed at ${credentialAddress}`);

  const factoryFactory = await hre.ethers.getContractFactory("AjoGroupFactory", deployer);
  const factoryContract = await factoryFactory.deploy(networkConfig.cUSDAddress, credentialAddress);
  await factoryContract.waitForDeployment();

  const factoryDeploymentTransaction = factoryContract.deploymentTransaction();
  if (!factoryDeploymentTransaction) {
    throw new Error("AjoGroupFactory deployment transaction is missing.");
  }

  await waitForConfirmations(factoryDeploymentTransaction, 5);

  const factoryAddress = (await factoryContract.getAddress()) as Address;
  console.log(`AjoGroupFactory deployed at ${factoryAddress}`);
  console.log(`Using Alfajores cUSD at ${networkConfig.cUSDAddress}`);

  const ownershipTransferTransaction = await credentialContract.transferOwnership(factoryAddress);
  await waitForConfirmations(ownershipTransferTransaction, 5);

  console.log(`Credential ownership transferred to ${factoryAddress}.`);

  const deploymentRecord: DeploymentRecord = {
    network: NETWORK_NAME,
    chainId: networkConfig.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployerAddress as Address,
    cUSD: networkConfig.cUSDAddress,
    credential: credentialAddress,
    factory: factoryAddress,
    transactions: {
      credentialDeployment: credentialDeploymentTransaction.hash,
      factoryDeployment: factoryDeploymentTransaction.hash,
      ownershipTransfer: ownershipTransferTransaction.hash,
    },
  };

  await writeDeploymentRecord(NETWORK_NAME, deploymentRecord);
  await updateFrontendAddresses(NETWORK_NAME, factoryAddress, networkConfig.cUSDAddress);

  console.log(`Wrote deployment record to ${resolveNetworkConfig(NETWORK_NAME).deploymentFile}`);
  console.log(`Updated frontend addresses in packages/react-app/lib/contracts/addresses.ts`);
  console.log("\nDeployment summary");
  console.log(`Credential: ${credentialAddress}`);
  console.log(`  ${explorerAddressUrl(NETWORK_NAME, credentialAddress)}`);
  console.log(`Factory:    ${factoryAddress}`);
  console.log(`  ${explorerAddressUrl(NETWORK_NAME, factoryAddress)}`);
  console.log(`cUSD:       ${networkConfig.cUSDAddress}`);
  console.log(`  ${explorerAddressUrl(NETWORK_NAME, networkConfig.cUSDAddress)}`);
  console.log(`Credential deployment tx: ${credentialDeploymentTransaction.hash}`);
  console.log(`  ${explorerTransactionUrl(NETWORK_NAME, credentialDeploymentTransaction.hash)}`);
  console.log(`Factory deployment tx: ${factoryDeploymentTransaction.hash}`);
  console.log(`  ${explorerTransactionUrl(NETWORK_NAME, factoryDeploymentTransaction.hash)}`);
  console.log(`Ownership transfer tx: ${ownershipTransferTransaction.hash}`);
  console.log(`  ${explorerTransactionUrl(NETWORK_NAME, ownershipTransferTransaction.hash)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
