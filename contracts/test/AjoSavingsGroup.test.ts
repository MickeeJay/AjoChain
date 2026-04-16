import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import type { ContractTransactionReceipt, ContractTransactionResponse, Log } from "ethers";
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

const GroupStatus = {
  FORMING: 0n,
  ACTIVE: 1n,
  COMPLETED: 2n,
  PAUSED: 3n,
} as const;

const GROUP_ID = 0n;
const MIN_GROUP_SIZE = 3n;
const DEFAULT_MAX_MEMBERS = 4n;
const DEFAULT_FREQUENCY = 7n;
const EXPIRY_FREQUENCY = 1n;
const CONTRIBUTION_AMOUNT = ethers.parseUnits("1", 18);
const INITIAL_TOKEN_BALANCE = ethers.parseUnits("10", 18);

type Signer = Awaited<ReturnType<typeof ethers.getSigners>>[number];

type Fixture = {
  deployer: Signer;
  alice: Signer;
  bob: Signer;
  carol: Signer;
  dave: Signer;
  eve: Signer;
  deployerAddress: string;
  aliceAddress: string;
  bobAddress: string;
  carolAddress: string;
  daveAddress: string;
  eveAddress: string;
  token: MockCUSD;
  credential: AjoCredential;
  factory: AjoGroupFactory;
  group: AjoSavingsGroup;
  groupAddress: string;
  inviteCode: string;
};

function normalize(address: string): string {
  return ethers.getAddress(address);
}

function normalizeAddresses(addresses: readonly string[]): string[] {
  return addresses.map((address) => normalize(address));
}

function sortAddresses(addresses: readonly string[]): string[] {
  return normalizeAddresses(addresses).sort((left, right) => left.localeCompare(right));
}

async function waitForReceipt(txPromise: Promise<ContractTransactionResponse>): Promise<ContractTransactionReceipt> {
  const transaction = await txPromise;
  const receipt = await transaction.wait();

  if (!receipt) {
    throw new Error("Transaction was not mined");
  }

  return receipt;
}

async function receiptTimestamp(receipt: ContractTransactionReceipt): Promise<bigint> {
  const block = await ethers.provider.getBlock(receipt.blockNumber);

  if (!block) {
    throw new Error("Missing block for transaction receipt");
  }

  return BigInt(block.timestamp);
}

function parseEvent(
  receipt: ContractTransactionReceipt,
  contract: { interface: { parseLog(log: Log): any } },
  eventName: string,
): any {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === eventName) {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  throw new Error(`Expected event ${eventName} was not emitted`);
}

async function deployFixture(frequencyInDays: bigint = DEFAULT_FREQUENCY): Promise<Fixture> {
  const [deployer, alice, bob, carol, dave, eve] = await ethers.getSigners();
  const [deployerAddress, aliceAddress, bobAddress, carolAddress, daveAddress, eveAddress] = await Promise.all([
    deployer.getAddress(),
    alice.getAddress(),
    bob.getAddress(),
    carol.getAddress(),
    dave.getAddress(),
    eve.getAddress(),
  ]);

  const token = await new MockCUSD__factory(deployer).deploy();
  await token.waitForDeployment();

  const credential = await new AjoCredential__factory(deployer).deploy();
  await credential.waitForDeployment();

  const factory = await new AjoGroupFactory__factory(deployer).deploy(await token.getAddress(), await credential.getAddress());
  await factory.waitForDeployment();

  await waitForReceipt(credential.connect(deployer).transferOwnership(await factory.getAddress()));

  for (const address of [deployerAddress, aliceAddress, bobAddress, carolAddress, daveAddress, eveAddress]) {
    await waitForReceipt(token.connect(deployer).mint(address, INITIAL_TOKEN_BALANCE));
  }

  await waitForReceipt(
    factory.connect(deployer).createGroup("Neighborhood Circle", CONTRIBUTION_AMOUNT, frequencyInDays, DEFAULT_MAX_MEMBERS),
  );

  const groupAddress = await factory.getGroupInfo(GROUP_ID);
  const group = AjoSavingsGroup__factory.connect(groupAddress, deployer);
  const inviteCode = await group.inviteCode();

  return {
    deployer,
    alice,
    bob,
    carol,
    dave,
    eve,
    deployerAddress,
    aliceAddress,
    bobAddress,
    carolAddress,
    daveAddress,
    eveAddress,
    token,
    credential,
    factory,
    group,
    groupAddress,
    inviteCode,
  };
}

async function deployDefaultFixture(): Promise<Fixture> {
  return deployFixture();
}

async function deployExpiryFixture(): Promise<Fixture> {
  return deployFixture(EXPIRY_FREQUENCY);
}

async function joinMember(fixture: Fixture, member: Signer): Promise<ContractTransactionReceipt> {
  return waitForReceipt(fixture.factory.connect(member).joinGroup(GROUP_ID, fixture.inviteCode));
}

async function joinMembers(fixture: Fixture, members: readonly Signer[]): Promise<void> {
  for (const member of members) {
    await joinMember(fixture, member);
  }
}

async function startGroup(fixture: Fixture, signer: Signer = fixture.deployer): Promise<ContractTransactionReceipt> {
  return waitForReceipt(fixture.group.connect(signer).startGroup());
}

async function approveMember(fixture: Fixture, member: Signer, amount: bigint = INITIAL_TOKEN_BALANCE): Promise<void> {
  await waitForReceipt(fixture.token.connect(member).approve(fixture.groupAddress, amount));
}

async function contributeMember(fixture: Fixture, member: Signer): Promise<ContractTransactionReceipt> {
  return waitForReceipt(fixture.group.connect(member).contribute());
}

async function voteMember(fixture: Fixture, member: Signer, pause: boolean): Promise<void> {
  await waitForReceipt(fixture.group.connect(member).voteOnPause(pause));
}

function rotateAddresses(addresses: readonly string[], startIndex: number): string[] {
  return [...addresses.slice(startIndex), ...addresses.slice(0, startIndex)];
}

describe("AjoSavingsGroup", function () {
  let fixture!: Fixture;

  beforeEach(async function () {
    fixture = await loadFixture(deployDefaultFixture);
  });

  describe("Member Management", function () {
    it("factory can add member and emits MemberAdded", async function () {
      const receipt = await joinMember(fixture, fixture.alice);
      const memberAdded = parseEvent(receipt, fixture.group, "MemberAdded");
      const receiptTime = await receiptTimestamp(receipt);

      expect(normalize(memberAdded.args[0])).to.equal(fixture.aliceAddress);
      expect(memberAdded.args[1]).to.equal(receiptTime);
      expect(await fixture.group.memberCount()).to.equal(2n);
      expect(await fixture.group.isMember(fixture.aliceAddress)).to.equal(true);

      const aliceState = await fixture.group.members(fixture.aliceAddress);
      expect(aliceState.wallet).to.equal(fixture.aliceAddress);
      expect(aliceState.isActive).to.equal(true);
      expect(aliceState.totalContributed).to.equal(0n);
      expect(aliceState.roundsCompleted).to.equal(0n);
    });

    it("non-factory cannot add member", async function () {
      await expect(fixture.group.connect(fixture.alice).addMember(fixture.bobAddress)).to.be.revertedWithCustomError(
        fixture.group,
        "OnlyFactory",
      );
    });

    it("cannot add member if group is active", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob]);
      await startGroup(fixture);

      await expect(fixture.factory.connect(fixture.carol).joinGroup(GROUP_ID, fixture.inviteCode)).to.be.revertedWithCustomError(
        fixture.group,
        "OnlyForming",
      );
    });

    it("cannot add member beyond maxMembers", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob, fixture.carol]);

      await expect(fixture.factory.connect(fixture.dave).joinGroup(GROUP_ID, fixture.inviteCode)).to.be.revertedWithCustomError(
        fixture.group,
        "GroupFull",
      );
    });

    it("cannot add same member twice", async function () {
      await joinMember(fixture, fixture.alice);

      await expect(fixture.factory.connect(fixture.alice).joinGroup(GROUP_ID, fixture.inviteCode)).to.be.revertedWithCustomError(
        fixture.group,
        "InvalidState",
      );
    });
  });

  describe("startGroup", function () {
    it("creator can start group with 3+ members", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob, fixture.carol]);
      const startReceipt = await startGroup(fixture);
      const startedEvent = parseEvent(startReceipt, fixture.group, "GroupStarted");
      const state = await fixture.group.getGroupState();
      const receiptTime = await receiptTimestamp(startReceipt);

      expect(state.status).to.equal(GroupStatus.ACTIVE);
      expect(state.currentRound).to.equal(0n);
      expect(state.payoutIndex).to.equal(0n);
      expect(state.memberOrder).to.have.length(4);
      expect(state.activeMembers).to.deep.equal([
        fixture.deployerAddress,
        fixture.aliceAddress,
        fixture.bobAddress,
        fixture.carolAddress,
      ]);
      expect(state.roundStartTime).to.equal(receiptTime);
      expect(state.remainingTime).to.be.greaterThan(0n);
      expect(normalizeAddresses(state.memberOrder)).to.deep.equal(normalizeAddresses(startedEvent.args[1]));
      expect(startedEvent.args[0]).to.equal(receiptTime);
      expect(normalize(await fixture.group.currentPayoutRecipient())).to.equal(normalize(state.memberOrder[0]));

      const uniqueMembers = new Set(normalizeAddresses(state.memberOrder));
      expect(uniqueMembers.size).to.equal(state.memberOrder.length);
      expect(sortAddresses(state.memberOrder)).to.deep.equal(
        sortAddresses([
          fixture.deployerAddress,
          fixture.aliceAddress,
          fixture.bobAddress,
          fixture.carolAddress,
        ]),
      );
    });

    it("non-creator cannot start group", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob]);

      await expect(startGroup(fixture, fixture.alice)).to.be.revertedWithCustomError(fixture.group, "OnlyCreator");
    });

    it("cannot start if fewer than MIN_GROUP_SIZE members", async function () {
      await joinMember(fixture, fixture.alice);

      await expect(startGroup(fixture)).to.be.revertedWithCustomError(fixture.group, "InsufficientMembers");
      expect(await fixture.group.memberCount()).to.equal(2n);
      expect(await fixture.group.status()).to.equal(GroupStatus.FORMING);
    });

    it("cannot start if already active", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob, fixture.carol]);
      await startGroup(fixture);

      await expect(startGroup(fixture)).to.be.revertedWithCustomError(fixture.group, "OnlyForming");
    });
  });

  describe("contribute", function () {
    it("member can contribute correct amount and emits ContributionReceived", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob]);
      await startGroup(fixture);
      await approveMember(fixture, fixture.alice);

      const contractBalanceBefore = await fixture.token.balanceOf(fixture.groupAddress);
      const aliceBalanceBefore = await fixture.token.balanceOf(fixture.aliceAddress);
      const receipt = await contributeMember(fixture, fixture.alice);
      const contributionEvent = parseEvent(receipt, fixture.group, "ContributionReceived");

      expect(normalize(contributionEvent.args[0])).to.equal(fixture.aliceAddress);
      expect(contributionEvent.args[1]).to.equal(0n);
      expect(contributionEvent.args[2]).to.equal(CONTRIBUTION_AMOUNT);

      const aliceState = await fixture.group.members(fixture.aliceAddress);
      const contractBalanceAfter = await fixture.token.balanceOf(fixture.groupAddress);
      const aliceBalanceAfter = await fixture.token.balanceOf(fixture.aliceAddress);

      expect(aliceState.hasContributedThisRound).to.equal(true);
      expect(aliceState.totalContributed).to.equal(CONTRIBUTION_AMOUNT);
      expect(contractBalanceBefore + CONTRIBUTION_AMOUNT).to.equal(contractBalanceAfter);
      expect(aliceBalanceBefore - CONTRIBUTION_AMOUNT).to.equal(aliceBalanceAfter);
      expect(await fixture.group.currentRound()).to.equal(0n);
      expect(await fixture.group.payoutIndex()).to.equal(0n);
      expect(await fixture.group.canExecutePayout()).to.equal(false);
    });

    it("cannot contribute if not a member", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob]);
      await startGroup(fixture);

      await expect(fixture.group.connect(fixture.dave).contribute()).to.be.revertedWithCustomError(fixture.group, "OnlyMember");
    });

    it("cannot contribute twice in the same round", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob]);
      await startGroup(fixture);
      await approveMember(fixture, fixture.alice);

      await contributeMember(fixture, fixture.alice);

      await expect(fixture.group.connect(fixture.alice).contribute()).to.be.revertedWithCustomError(
        fixture.group,
        "AlreadyContributed",
      );
    });

    it("cannot contribute if group is not active", async function () {
      await expect(fixture.group.connect(fixture.deployer).contribute()).to.be.revertedWithCustomError(
        fixture.group,
        "OnlyActive",
      );
    });

    it("cannot contribute without ERC20 approval", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob]);
      await startGroup(fixture);

      await expect(fixture.group.connect(fixture.alice).contribute()).to.be.revertedWithCustomError(
        fixture.group,
        "AllowanceTooLow",
      );
    });

    it("cannot contribute after the round deadline", async function () {
      const expiryFixture = await loadFixture(deployExpiryFixture);

      await joinMembers(expiryFixture, [expiryFixture.alice, expiryFixture.bob]);
      await startGroup(expiryFixture);

      await time.increase(24 * 60 * 60 + 1);

      await expect(expiryFixture.group.connect(expiryFixture.alice).contribute()).to.be.revertedWithCustomError(
        expiryFixture.group,
        "RoundExpired",
      );
    });
  });

  describe("Round Payout - Full Cycle", function () {
    it("executes the full 4-member payout cycle and completes the group", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob, fixture.carol]);
      const startReceipt = await startGroup(fixture);
      const startedEvent = parseEvent(startReceipt, fixture.group, "GroupStarted");
      const stateAfterStart = await fixture.group.getGroupState();
      const memberOrder = normalizeAddresses(stateAfterStart.memberOrder);
      const startTime = await receiptTimestamp(startReceipt);

      expect(normalizeAddresses(startedEvent.args[1])).to.deep.equal(memberOrder);
      expect(stateAfterStart.status).to.equal(GroupStatus.ACTIVE);
      expect(stateAfterStart.roundStartTime).to.equal(startTime);
      expect(await fixture.group.canExecutePayout()).to.equal(false);

      const signerByAddress = new Map<string, Signer>([
        [fixture.deployerAddress, fixture.deployer],
        [fixture.aliceAddress, fixture.alice],
        [fixture.bobAddress, fixture.bob],
        [fixture.carolAddress, fixture.carol],
      ]);

      for (const signer of signerByAddress.values()) {
        await approveMember(fixture, signer);
      }

      const initialBalances = new Map<string, bigint>();
      for (const address of memberOrder) {
        initialBalances.set(address, await fixture.token.balanceOf(address));
      }

      for (let round = 0; round < memberOrder.length; round += 1) {
        const contributionOrder = rotateAddresses(memberOrder, round);
        const recipient = contributionOrder[0];
        const recipientSigner = signerByAddress.get(recipient);

        if (!recipientSigner) {
          throw new Error(`Missing signer for recipient ${recipient}`);
        }

        const recipientBalanceBeforePayout = await fixture.token.balanceOf(recipient);
        let recipientBalanceAfterOwnContribution = recipientBalanceBeforePayout;

        for (let index = 0; index < contributionOrder.length; index += 1) {
          const contributor = contributionOrder[index];
          const contributorSigner = signerByAddress.get(contributor);

          if (!contributorSigner) {
            throw new Error(`Missing signer for contributor ${contributor}`);
          }

          const receipt = await contributeMember(fixture, contributorSigner);
          const contributionEvent = parseEvent(receipt, fixture.group, "ContributionReceived");

          expect(normalize(contributionEvent.args[0])).to.equal(contributor);
          expect(contributionEvent.args[1]).to.equal(BigInt(round));
          expect(contributionEvent.args[2]).to.equal(CONTRIBUTION_AMOUNT);

          if (index < contributionOrder.length - 1) {
            const contributorState = await fixture.group.members(contributor);
            expect(contributorState.hasContributedThisRound).to.equal(true);
            expect(await fixture.token.balanceOf(fixture.groupAddress)).to.equal(CONTRIBUTION_AMOUNT * BigInt(index + 1));
          }

          if (index === 0) {
            recipientBalanceAfterOwnContribution = await fixture.token.balanceOf(recipient);
          }

          if (index === contributionOrder.length - 1) {
            const roundCompletedEvent = parseEvent(receipt, fixture.group, "RoundCompleted");
            const receiptTime = await receiptTimestamp(receipt);

            expect(roundCompletedEvent.args[0]).to.equal(BigInt(round));
            expect(normalize(roundCompletedEvent.args[1])).to.equal(recipient);
            expect(roundCompletedEvent.args[2]).to.equal(CONTRIBUTION_AMOUNT * BigInt(memberOrder.length));
            expect(await fixture.token.balanceOf(recipient)).to.equal(
              recipientBalanceAfterOwnContribution + CONTRIBUTION_AMOUNT * BigInt(memberOrder.length),
            );
            expect(await fixture.token.balanceOf(fixture.groupAddress)).to.equal(0n);

            const groupState = await fixture.group.getGroupState();
            expect(groupState.currentRound).to.equal(BigInt(round + 1));
            expect(groupState.payoutIndex).to.equal(BigInt(round + 1));
            expect(groupState.roundStartTime).to.equal(receiptTime);

            for (const address of memberOrder) {
              const memberState = await fixture.group.members(address);
              expect(memberState.hasContributedThisRound).to.equal(false);
              expect(memberState.roundsCompleted).to.equal(BigInt(round + 1));
              expect(memberState.totalContributed).to.equal(CONTRIBUTION_AMOUNT * BigInt(round + 1));
            }

            if (round < memberOrder.length - 1) {
              expect(groupState.status).to.equal(GroupStatus.ACTIVE);
              expect(normalize(await fixture.group.currentPayoutRecipient())).to.equal(memberOrder[round + 1]);
              expect(await fixture.group.isCompleted()).to.equal(false);
            } else {
              const groupCompletedEvent = parseEvent(receipt, fixture.group, "GroupCompleted");
              const completedAt = await receiptTimestamp(receipt);

              expect(groupState.status).to.equal(GroupStatus.COMPLETED);
              expect(await fixture.group.isCompleted()).to.equal(true);
              expect(await fixture.group.getRemainingTime()).to.equal(0n);
              expect(await fixture.group.currentCycle()).to.equal(BigInt(memberOrder.length));
              expect(await fixture.group.currentRound()).to.equal(BigInt(memberOrder.length));
              expect(await fixture.group.payoutIndex()).to.equal(BigInt(memberOrder.length));
              expect(groupCompletedEvent.args[0]).to.equal(BigInt(memberOrder.length));
              expect(groupCompletedEvent.args[1]).to.equal(completedAt);
            }
          }
        }
      }

      for (const [address, balanceBefore] of initialBalances.entries()) {
        const balanceAfter = await fixture.token.balanceOf(address);
        expect(balanceAfter).to.equal(balanceBefore);
      }

      for (let index = 0; index < memberOrder.length; index += 1) {
        const member = memberOrder[index];
        const credentials = await fixture.credential.getCredentials(member);
        const reputation = await fixture.credential.getUserReputation(member);

        expect(credentials).to.deep.equal([BigInt(index + 1)]);
        expect(reputation).to.equal(1n);

        const credentialData = await fixture.credential.credentials(BigInt(index + 1));
        expect(normalize(credentialData.recipient)).to.equal(member);
        expect(normalize(credentialData.groupContract)).to.equal(normalize(fixture.groupAddress));
        expect(credentialData.cyclesCompleted).to.equal(1n);
        expect(credentialData.totalSaved).to.equal(CONTRIBUTION_AMOUNT * BigInt(memberOrder.length));
        expect(credentialData.groupName).to.equal("Neighborhood Circle");
      }
    });

    it("cannot execute payout before a round is complete", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob]);
      await startGroup(fixture);

      expect(await fixture.group.canExecutePayout()).to.equal(false);
      await expect(fixture.group.executePayout()).to.be.revertedWithCustomError(fixture.group, "InvalidState");
    });
  });

  describe("Pause and Emergency", function () {
    it("creator can pause and resume after threshold votes", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob, fixture.carol]);
      await startGroup(fixture);

      await voteMember(fixture, fixture.deployer, true);
      await voteMember(fixture, fixture.alice, true);
      await voteMember(fixture, fixture.bob, true);

      await waitForReceipt(fixture.group.pauseRound(true));

      const pausedState = await fixture.group.getGroupState();
      expect(pausedState.status).to.equal(GroupStatus.PAUSED);
      expect(pausedState.pauseSupportVotes).to.equal(0n);
      expect(pausedState.pauseOppositionVotes).to.equal(0n);

      await voteMember(fixture, fixture.deployer, false);
      await voteMember(fixture, fixture.alice, false);
      await voteMember(fixture, fixture.bob, false);

      await waitForReceipt(fixture.group.pauseRound(false));

      const resumedState = await fixture.group.getGroupState();
      expect(resumedState.status).to.equal(GroupStatus.ACTIVE);
      expect(resumedState.pauseSupportVotes).to.equal(0n);
      expect(resumedState.pauseOppositionVotes).to.equal(0n);
    });

    it("cannot contribute while paused", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob, fixture.carol]);
      await startGroup(fixture);

      await voteMember(fixture, fixture.deployer, true);
      await voteMember(fixture, fixture.alice, true);
      await voteMember(fixture, fixture.bob, true);
      await waitForReceipt(fixture.group.pauseRound(true));

      await expect(fixture.group.connect(fixture.alice).contribute()).to.be.revertedWithCustomError(
        fixture.group,
        "OnlyActive",
      );
    });

    it("rejects pausing without enough votes", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob, fixture.carol]);
      await startGroup(fixture);

      await voteMember(fixture, fixture.deployer, true);
      await voteMember(fixture, fixture.alice, true);

      await expect(fixture.group.pauseRound(true)).to.be.revertedWithCustomError(fixture.group, "InsufficientVotes");
      expect(await fixture.group.status()).to.equal(GroupStatus.ACTIVE);
    });

    it("rejects resuming without enough votes", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob, fixture.carol]);
      await startGroup(fixture);

      await voteMember(fixture, fixture.deployer, true);
      await voteMember(fixture, fixture.alice, true);
      await voteMember(fixture, fixture.bob, true);
      await waitForReceipt(fixture.group.pauseRound(true));

      await voteMember(fixture, fixture.deployer, false);
      await voteMember(fixture, fixture.alice, false);

      await expect(fixture.group.pauseRound(false)).to.be.revertedWithCustomError(fixture.group, "InsufficientVotes");
      expect(await fixture.group.status()).to.equal(GroupStatus.PAUSED);
    });

    it("member can emergencyExit while forming", async function () {
      await joinMember(fixture, fixture.alice);

      await waitForReceipt(fixture.group.connect(fixture.alice).emergencyExit());

      const state = await fixture.group.getGroupState();
      const aliceState = await fixture.group.members(fixture.aliceAddress);

      expect(state.status).to.equal(GroupStatus.FORMING);
      expect(state.activeMembers).to.deep.equal([fixture.deployerAddress]);
      expect(await fixture.group.memberCount()).to.equal(1n);
      expect(await fixture.group.isMember(fixture.aliceAddress)).to.equal(false);
      expect(aliceState.isActive).to.equal(false);
      expect(aliceState.totalContributed).to.equal(0n);
      expect(aliceState.roundsCompleted).to.equal(0n);
    });

    it("cannot emergencyExit when active", async function () {
      await joinMembers(fixture, [fixture.alice, fixture.bob]);
      await startGroup(fixture);

      await expect(fixture.group.connect(fixture.alice).emergencyExit()).to.be.revertedWithCustomError(
        fixture.group,
        "OnlyForming",
      );
    });
  });
});
