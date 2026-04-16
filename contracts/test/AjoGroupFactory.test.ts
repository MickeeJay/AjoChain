import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
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

  describe("createGroup", function () {
    it("should deploy a new AjoSavingsGroup and emit GroupCreated", async function () {
      const { groupId, groupAddress, group, inviteCode } = await deployGroup(groupName, contributionAmount, 7n, 3n);

      expect(await factory.cUSDToken()).to.equal(await mockCUSD.getAddress());
      expect(await factory.groupCount()).to.equal(1n);
      expect(await factory.getUserGroups(ownerAddress)).to.deep.equal([groupId]);
      expect(await factory.getGroupInfo(groupId)).to.equal(groupAddress);
      expect(await factory.groups(groupId)).to.equal(groupAddress);
      expect(await credential.authorizedGroups(groupAddress)).to.equal(true);
      expect(await group.memberCount()).to.equal(1n);
      expect(await group.isMember(ownerAddress)).to.equal(true);
      expect(await group.groupName()).to.equal(groupName);
      expect(inviteCode).to.match(/^0x[a-fA-F0-9]{64}$/);
    });

    it("should allow a daily frequency", async function () {
      const { group } = await deployGroup("Daily Circle", contributionAmount, 1n, 3n);

      expect(await group.frequencyInDays()).to.equal(1n);
    });

    it("should allow a monthly frequency", async function () {
      const { group } = await deployGroup("Monthly Circle", contributionAmount, 30n, 3n);

      expect(await group.frequencyInDays()).to.equal(30n);
    });

    it("should increment groupCount", async function () {
      await deployGroup(groupName, contributionAmount, 7n, 3n);

      expect(await factory.groupCount()).to.equal(1n);
    });

    it("should add groupId to creator's userGroups", async function () {
      const { groupId } = await deployGroup(groupName, contributionAmount, 7n, 3n);

      expect(await factory.getUserGroups(ownerAddress)).to.deep.equal([groupId]);
    });

    it("should store group address in groups mapping", async function () {
      const { groupId, groupAddress } = await deployGroup(groupName, contributionAmount, 7n, 3n);

      expect(await factory.groups(groupId)).to.equal(groupAddress);
      expect(await factory.getGroupInfo(groupId)).to.equal(groupAddress);
    });

    it("should revert if maxMembers is below the minimum group size", async function () {
      await expect(factory.connect(owner).createGroup(groupName, contributionAmount, 7n, 2n)).to.be.revertedWithCustomError(
        factory,
        "InvalidGroupSize",
      );
    });

    it("should revert if maxMembers is above the maximum group size", async function () {
      await expect(factory.connect(owner).createGroup(groupName, contributionAmount, 7n, 21n)).to.be.revertedWithCustomError(
        factory,
        "InvalidGroupSize",
      );
    });

    it("should revert if contributionAmount is 0", async function () {
      await expect(factory.connect(owner).createGroup(groupName, 0n, 7n, 3n)).to.be.revertedWithCustomError(
        factory,
        "InvalidContributionAmount",
      );
    });

    it("should revert if contributionAmount is above MAX_CONTRIBUTION", async function () {
      await expect(factory.connect(owner).createGroup(groupName, overMaxContributionAmount, 7n, 3n)).to.be.revertedWithCustomError(
        factory,
        "InvalidContributionAmount",
      );
    });

    it("should revert if the total pot exceeds MAX_POT_VALUE", async function () {
      await expect(factory.connect(owner).createGroup(groupName, maxPotContributionAmount, 7n, 11n)).to.be.revertedWithCustomError(
        factory,
        "InvalidPotValue",
      );
    });

    it("should revert if frequencyInDays is not 1, 7, or 30", async function () {
      await expect(factory.connect(owner).createGroup(groupName, contributionAmount, 2n, 3n)).to.be.revertedWithCustomError(
        factory,
        "InvalidFrequency",
      );
    });
  });

  describe("joinGroup", function () {
    it("should allow a member to join with the correct invite code", async function () {
      const { groupId, group, inviteCode } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      await joinGroup(alice, groupId, inviteCode);

      expect(await factory.getUserGroups(aliceAddress)).to.deep.equal([groupId]);
      expect(await group.memberCount()).to.equal(2n);
      expect(await group.isMember(aliceAddress)).to.equal(true);
    });

    it("should add groupId to the joiner's userGroups", async function () {
      const { groupId, inviteCode } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      await joinGroup(alice, groupId, inviteCode);

      expect(await factory.getUserGroups(aliceAddress)).to.deep.equal([groupId]);
    });

    it("should emit MemberJoined event", async function () {
      const { groupId, inviteCode } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      await expect(factory.connect(alice).joinGroup(groupId, inviteCode))
        .to.emit(factory, "MemberJoined")
        .withArgs(groupId, aliceAddress);
    });

    it("should revert with a wrong invite code", async function () {
      const { groupId } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      await expect(factory.connect(alice).joinGroup(groupId, inviteMismatchCode)).to.be.revertedWithCustomError(
        factory,
        "InvalidInviteCode",
      );
    });

    it("should revert if the group is already ACTIVE", async function () {
      const { groupId, group, inviteCode } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      await joinGroup(alice, groupId, inviteCode);
      await joinGroup(bob, groupId, inviteCode);
      await group.startGroup();

      expect(await group.status()).to.equal(1n);

      await expect(factory.connect(carol).joinGroup(groupId, inviteCode)).to.be.revertedWithCustomError(group, "OnlyForming");
    });

    it("should revert if the group is full", async function () {
      const { groupId, group, inviteCode } = await deployGroup(groupName, contributionAmount, 7n, 3n);

      await joinGroup(alice, groupId, inviteCode);
      await joinGroup(bob, groupId, inviteCode);

      await expect(factory.connect(carol).joinGroup(groupId, inviteCode)).to.be.revertedWithCustomError(
        group,
        "GroupFull",
      );
    });

    it("should revert if the member is already in the group", async function () {
      const { groupId, group, inviteCode } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      await joinGroup(alice, groupId, inviteCode);

      await expect(factory.connect(alice).joinGroup(groupId, inviteCode)).to.be.revertedWithCustomError(
        group,
        "InvalidState",
      );
    });

    it("should revert if the group does not exist", async function () {
      await expect(factory.connect(alice).joinGroup(999n, inviteMismatchCode)).to.be.revertedWithCustomError(
        factory,
        "GroupNotFound",
      );
    });
  });

  describe("authorizeGroup", function () {
    it("should authorize a group through the credential contract", async function () {
      const { groupAddress } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      await expect(factory.authorizeGroup(groupAddress)).to.emit(credential, "GroupAuthorized").withArgs(groupAddress);
      expect(await credential.authorizedGroups(groupAddress)).to.equal(true);
    });

    it("should revert when called by a non-owner", async function () {
      const { groupAddress } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      await expect(factory.connect(alice).authorizeGroup(groupAddress)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  describe("view functions", function () {
    it("getUserGroups should return the correct array of group IDs", async function () {
      const firstGroup = await deployGroup(groupName, contributionAmount, 7n, 4n);
      await joinGroup(alice, firstGroup.groupId, firstGroup.inviteCode);
      await deployGroup(secondGroupName, contributionAmount, 7n, 4n);

      expect(await factory.getUserGroups(ownerAddress)).to.deep.equal([0n, 1n]);
      expect(await factory.getUserGroups(aliceAddress)).to.deep.equal([0n]);
    });

    it("getActiveGroups with pagination should return correct slice", async function () {
      await deployGroup(groupName, contributionAmount, 7n, 4n);
      await deployGroup(secondGroupName, contributionAmount, 7n, 4n);
      await deployGroup(thirdGroupName, contributionAmount, 7n, 4n);

      expect(await factory.getActiveGroups(1n, 2n)).to.deep.equal([1n, 2n]);
      expect(await factory.getActiveGroups(1n, 5n)).to.deep.equal([1n, 2n]);
      expect(await factory.getActiveGroups(3n, 1n)).to.deep.equal([]);
      expect(await factory.getActiveGroups(0n, 0n)).to.deep.equal([]);
    });

    it("getGroupInfo should return the correct contract address", async function () {
      const { groupId, groupAddress } = await deployGroup(groupName, contributionAmount, 7n, 4n);

      expect(await factory.getGroupInfo(groupId)).to.equal(groupAddress);
    });

    it("should return the stored credential contract address", async function () {
      expect(await factory.credentialContract()).to.equal(await credential.getAddress());
    });
  });

  describe("MockCUSD", function () {
    it("allows any account to mint", async function () {
      const mintAmount = ethers.parseUnits("12", 18);

      await mockCUSD.connect(alice).mint(eveAddress, mintAmount);

      expect(await mockCUSD.balanceOf(eveAddress)).to.equal(mintAmount);
    });

    it("allows different accounts to mint to the same recipient", async function () {
      const mintAmount = ethers.parseUnits("3", 18);

      await mockCUSD.connect(bob).mint(daveAddress, mintAmount);
      await mockCUSD.connect(carol).mint(daveAddress, mintAmount);

      expect(await mockCUSD.balanceOf(daveAddress)).to.equal(mintAmount * 2n);
    });
  });
});
