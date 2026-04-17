import { config as loadEnv } from "dotenv";
import hre from "hardhat";
import { Wallet } from "ethers";
import type { Signer } from "ethers";
import type { Address } from "viem";
import {
  assertCorrectNetwork,
  assertPrivateKey,
  ensureMinimumBalance,
  explorerAddressUrl,
  getDeployerSigner,
  readDeploymentRecord,
  resolveNetworkConfig,
} from "./alfajores.js";
import { AjoGroupFactory__factory, AjoSavingsGroup__factory } from "../typechain-types";

loadEnv();

const NETWORK_NAME = "alfajores";
const JOINER_FUNDS = hre.ethers.parseEther("0.01");

async function fundJoiner(deployer: Signer, joinerAddress: string) {
  const fundingTransaction = await deployer.sendTransaction({
    to: joinerAddress,
    value: JOINER_FUNDS,
  });

  await fundingTransaction.wait();
}

async function main() {
  assertPrivateKey();
  const networkConfig = await assertCorrectNetwork(hre, NETWORK_NAME);
  const deployment = await readDeploymentRecord(NETWORK_NAME);
  const { deployer, deployerAddress } = await getDeployerSigner(hre);

  await ensureMinimumBalance(hre, deployerAddress);

  if (deployment.network !== NETWORK_NAME) {
    throw new Error(`Deployment record at ${resolveNetworkConfig(NETWORK_NAME).deploymentFile} is not for ${NETWORK_NAME}.`);
  }

  const factory = AjoGroupFactory__factory.connect(deployment.factory, deployer);
  const groupCountBeforeCreate = await factory.groupCount();
  const groupName = "Alfajores Smoke Test";
  const contributionAmount = hre.ethers.parseUnits("1", 18);
  const frequencyInDays = 7n;
  const maxMembers = 3n;

  console.log(`Connected to ${NETWORK_NAME} (${networkConfig.chainId}).`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Factory: ${deployment.factory}`);
  console.log(`Credential: ${deployment.credential}`);
  console.log(`cUSD: ${deployment.cUSD}`);

  const createGroupTransaction = await factory.createGroup(groupName, contributionAmount, frequencyInDays, maxMembers);
  await createGroupTransaction.wait();

  const groupId = groupCountBeforeCreate;
  const groupAddress = (await factory.groups(groupId)) as Address;

  if (groupAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(`No group address was stored for groupId ${groupId.toString()}.`);
  }

  const group = AjoSavingsGroup__factory.connect(groupAddress, deployer);
  const inviteCode = await group.inviteCode();

  if (!(await group.isMember(deployerAddress))) {
    throw new Error("The deployer should already be a member because the creator is seeded into the group.");
  }

  const joinerOne = Wallet.createRandom().connect(hre.ethers.provider);
  const joinerTwo = Wallet.createRandom().connect(hre.ethers.provider);

  await fundJoiner(deployer, joinerOne.address);
  await fundJoiner(deployer, joinerTwo.address);

  const joinerOneFactory = AjoGroupFactory__factory.connect(deployment.factory, joinerOne);
  const joinerTwoFactory = AjoGroupFactory__factory.connect(deployment.factory, joinerTwo);

  await (await joinerOneFactory.joinGroup(groupId, inviteCode)).wait();
  await (await joinerTwoFactory.joinGroup(groupId, inviteCode)).wait();

  const memberCount = await group.memberCount();
  if (memberCount < maxMembers) {
    throw new Error(`Expected at least ${maxMembers.toString()} members before starting the group, found ${memberCount.toString()}.`);
  }

  await (await group.startGroup()).wait();

  const status = await group.status();
  if (status !== 1n) {
    throw new Error(`Smoke test failed: expected group status ACTIVE (1), found ${status.toString()}.`);
  }

  console.log("Smoke test succeeded.");
  console.log(`Group ID: ${groupId.toString()}`);
  console.log(`Group address: ${groupAddress}`);
  console.log(`Group explorer link: ${explorerAddressUrl(NETWORK_NAME, groupAddress)}`);
  console.log(`Factory explorer link: ${explorerAddressUrl(NETWORK_NAME, deployment.factory)}`);
  console.log(`Credential explorer link: ${explorerAddressUrl(NETWORK_NAME, deployment.credential)}`);
  console.log(`cUSD explorer link: ${explorerAddressUrl(NETWORK_NAME, deployment.cUSD)}`);
  console.log(`Deployer explorer link: ${explorerAddressUrl(NETWORK_NAME, deployerAddress)}`);
  console.log(`Joiner 1: ${joinerOne.address}`);
  console.log(`Joiner 2: ${joinerTwo.address}`);
  console.log(`Joiner funding: ${JOINER_FUNDS.toString()} wei each`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});