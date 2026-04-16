import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import {
  AjoCredential,
  AjoCredential__factory,
  AjoGroupFactory,
  AjoGroupFactory__factory,
  AjoSavingsGroup,
  AjoSavingsGroup__factory,
  MockCUSD,
  MockCUSD__factory,
} from "../typechain-types";

describe("AjoGroupFactory", function () {
  type TestSigner = Awaited<ReturnType<typeof ethers.getSigners>>[number];

  let owner: TestSigner;
  let alice: TestSigner;
  let bob: TestSigner;
  let carol: TestSigner;
  let dave: TestSigner;
  let eve: TestSigner;

  let ownerAddress: string;
  let aliceAddress: string;
  let bobAddress: string;
  let carolAddress: string;
  let daveAddress: string;
  let eveAddress: string;

  let mockCUSD: MockCUSD;
  let credential: AjoCredential;
  let factory: AjoGroupFactory;

  const groupName = "Circle One";
  const secondGroupName = "Circle Two";
  const thirdGroupName = "Circle Three";
  const contributionAmount = ethers.parseUnits("1", 18);
  const maxContributionAmount = ethers.parseUnits("50", 18);
  const overMaxContributionAmount = ethers.parseUnits("51", 18);
  const maxPotContributionAmount = ethers.parseUnits("50", 18);
  const inviteMismatchCode = ethers.keccak256(ethers.toUtf8Bytes("wrong invite code"));
  const maxUint256 = (1n << 256n) - 1n;

  async function deployGroup(
    name: string,
    contribution: bigint,
    frequencyInDays: bigint,
    maxMembers: bigint,
    signer: TestSigner = owner,
  ) {
    const groupId = await factory.groupCount();
    const creatorAddress = await signer.getAddress();

    await expect(factory.connect(signer).createGroup(name, contribution, frequencyInDays, maxMembers))
      .to.emit(factory, "GroupCreated")
      .withArgs(groupId, anyValue, creatorAddress, name);

    const groupAddress = await factory.getGroupInfo(groupId);
    const group = AjoSavingsGroup__factory.connect(groupAddress, owner);
    const inviteCode = await group.inviteCode();

    return {
      groupId,
      groupAddress,
      group,
      inviteCode,
    };
  }

  async function joinGroup(signer: TestSigner, groupId: bigint, inviteCode: string) {
    const memberAddress = await signer.getAddress();

    await expect(factory.connect(signer).joinGroup(groupId, inviteCode))
      .to.emit(factory, "MemberJoined")
      .withArgs(groupId, memberAddress);
  }

  beforeEach(async function () {
    [owner, alice, bob, carol, dave, eve] = await ethers.getSigners();
    [ownerAddress, aliceAddress, bobAddress, carolAddress, daveAddress, eveAddress] = await Promise.all([
      owner.getAddress(),
      alice.getAddress(),
      bob.getAddress(),
      carol.getAddress(),
      dave.getAddress(),
      eve.getAddress(),
    ]);

    mockCUSD = await new MockCUSD__factory(owner).deploy();
    await mockCUSD.waitForDeployment();

    credential = await new AjoCredential__factory(owner).deploy();
    await credential.waitForDeployment();

    factory = await new AjoGroupFactory__factory(owner).deploy(await mockCUSD.getAddress(), await credential.getAddress());
    await factory.waitForDeployment();

    await credential.transferOwnership(await factory.getAddress());
  });

  describe("constructor", function () {
    it("reverts when the token address is zero", async function () {
      const factoryFactory = new AjoGroupFactory__factory(owner);

      await expect(factoryFactory.deploy(ethers.ZeroAddress, await credential.getAddress())).to.be.revertedWithCustomError(
        factoryFactory,
        "InvalidTokenAddress",
      );
    });

    it("reverts when the credential address is zero", async function () {
      const factoryFactory = new AjoGroupFactory__factory(owner);

      await expect(factoryFactory.deploy(await mockCUSD.getAddress(), ethers.ZeroAddress)).to.be.revertedWithCustomError(
        factoryFactory,
        "InvalidCredentialAddress",
      );
    });
  });
});
