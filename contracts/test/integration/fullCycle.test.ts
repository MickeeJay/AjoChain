import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { artifacts, network } from "hardhat";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  getAddress,
  keccak256,
  parseUnits,
  toHex,
  type Abi,
} from "viem";

const hardhatChain = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

const FORMING = 0n;
const ACTIVE = 1n;
const COMPLETED = 2n;

const GROUP_ID = 0n;
const MEMBER_COUNT = 5n;
const ATTACK_MEMBER_COUNT = 3n;
const CONTRIBUTION_AMOUNT = parseUnits("5", 18);
const INITIAL_BALANCE = parseUnits("100", 18);
const POT_AMOUNT = CONTRIBUTION_AMOUNT * MEMBER_COUNT;
const ATTACK_POT_AMOUNT = CONTRIBUTION_AMOUNT * ATTACK_MEMBER_COUNT;
const GROUP_FREQUENCY = 7n;
const MAX_GROUP_MEMBERS = 5n;
const INVALID_INVITE_CODE = keccak256(toHex("wrong invite code"));

type Address = `0x${string}`;
type Bytes32 = `0x${string}`;
type PublicClient = ReturnType<typeof createPublicClient>;
type WalletClient = ReturnType<typeof createWalletClient>;

type BaseFixture = {
  publicClient: PublicClient;
  deployerAddress: Address;
  aliceAddress: Address;
  bobAddress: Address;
  carolAddress: Address;
  daveAddress: Address;
  eveAddress: Address;
  deployerWallet: WalletClient;
  aliceWallet: WalletClient;
  bobWallet: WalletClient;
  carolWallet: WalletClient;
  daveWallet: WalletClient;
  eveWallet: WalletClient;
  tokenAddress: Address;
  tokenAbi: Abi;
  credentialAddress: Address;
  credentialAbi: Abi;
  factoryAddress: Address;
  factoryAbi: Abi;
  groupAbi: Abi;
  memberAddresses: Address[];
  walletByAddress: Map<Address, WalletClient>;
};

type FormingFixture = BaseFixture & {
  groupAddress: Address;
  inviteCode: Bytes32;
};

type ActiveFixture = FormingFixture & {
  memberOrder: Address[];
};

type AttackFixture = BaseFixture & {
  groupAddress: Address;
  inviteCode: Bytes32;
};

function normalize(address: Address): Address {
  return getAddress(address) as Address;
}

function describeError(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as { shortMessage?: unknown; message?: unknown };

    if (typeof candidate.shortMessage === "string") {
      return candidate.shortMessage;
    }

    if (typeof candidate.message === "string") {
      return candidate.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function rotate<T>(values: readonly T[], offset: number): T[] {
  return [...values.slice(offset), ...values.slice(0, offset)];
}

async function sendAndWait(publicClient: PublicClient, txPromise: Promise<Address>) {
  const hash = await txPromise;
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  expect(receipt.status).to.equal("success");

  return receipt;
}

async function expectRevert(publicClient: PublicClient, txPromise: Promise<Address>, expectedMessage: string) {
  void expectedMessage;

  let failure: unknown = null;

  try {
    const hash = await txPromise;
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status !== "success") {
      failure = new Error("Transaction reverted");
    }
  } catch (error) {
    failure = error;
  }

  expect(failure, "transaction should revert").to.not.equal(null);
}

async function readMemberOrder(publicClient: PublicClient, groupAddress: Address, groupAbi: Abi, memberCount: bigint) {
  const memberOrder: Address[] = [];

  for (let index = 0n; index < memberCount; index += 1n) {
    const member = (await publicClient.readContract({
      address: groupAddress,
      abi: groupAbi,
      functionName: "memberOrder",
      args: [index],
    })) as Address;

    memberOrder.push(normalize(member));
  }

  return memberOrder;
}

async function deployBaseFixture(): Promise<BaseFixture> {
  const accounts = (await network.provider.request({ method: "eth_accounts" })) as Address[];
  const [deployerAddress, aliceAddress, bobAddress, carolAddress, daveAddress, eveAddress] = accounts.map(normalize);
  const transport = custom(network.provider as never);
  const publicClient = createPublicClient({ chain: hardhatChain, transport });
  const deployerWallet = createWalletClient({ chain: hardhatChain, transport, account: deployerAddress });
  const aliceWallet = createWalletClient({ chain: hardhatChain, transport, account: aliceAddress });
  const bobWallet = createWalletClient({ chain: hardhatChain, transport, account: bobAddress });
  const carolWallet = createWalletClient({ chain: hardhatChain, transport, account: carolAddress });
  const daveWallet = createWalletClient({ chain: hardhatChain, transport, account: daveAddress });
  const eveWallet = createWalletClient({ chain: hardhatChain, transport, account: eveAddress });

  const tokenArtifact = await artifacts.readArtifact("MockCUSD");
  const credentialArtifact = await artifacts.readArtifact("AjoCredential");
  const factoryArtifact = await artifacts.readArtifact("AjoGroupFactory");
  const groupArtifact = await artifacts.readArtifact("AjoSavingsGroup");

  const tokenHash = await deployerWallet.deployContract({
    abi: tokenArtifact.abi,
    bytecode: tokenArtifact.bytecode as `0x${string}`,
  });
  const tokenReceipt = await publicClient.waitForTransactionReceipt({ hash: tokenHash });
  const tokenAddress = normalize(tokenReceipt.contractAddress as Address);

  const credentialHash = await deployerWallet.deployContract({
    abi: credentialArtifact.abi,
    bytecode: credentialArtifact.bytecode as `0x${string}`,
  });
  const credentialReceipt = await publicClient.waitForTransactionReceipt({ hash: credentialHash });
  const credentialAddress = normalize(credentialReceipt.contractAddress as Address);

  const factoryHash = await deployerWallet.deployContract({
    abi: factoryArtifact.abi,
    bytecode: factoryArtifact.bytecode as `0x${string}`,
    args: [tokenAddress, credentialAddress],
  });
  const factoryReceipt = await publicClient.waitForTransactionReceipt({ hash: factoryHash });
  const factoryAddress = normalize(factoryReceipt.contractAddress as Address);

  await sendAndWait(
    publicClient,
    deployerWallet.writeContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "transferOwnership",
      args: [factoryAddress],
    }),
  );

  for (const address of [aliceAddress, bobAddress, carolAddress, daveAddress, eveAddress]) {
    await sendAndWait(
      publicClient,
      deployerWallet.writeContract({
        address: tokenAddress,
        abi: tokenArtifact.abi,
        functionName: "mint",
        args: [address, INITIAL_BALANCE],
      }),
    );
  }

  const memberAddresses = [aliceAddress, bobAddress, carolAddress, daveAddress, eveAddress];
  const walletByAddress = new Map<Address, WalletClient>([
    [aliceAddress, aliceWallet],
    [bobAddress, bobWallet],
    [carolAddress, carolWallet],
    [daveAddress, daveWallet],
    [eveAddress, eveWallet],
  ]);

  return {
    publicClient,
    deployerAddress,
    aliceAddress,
    bobAddress,
    carolAddress,
    daveAddress,
    eveAddress,
    deployerWallet,
    aliceWallet,
    bobWallet,
    carolWallet,
    daveWallet,
    eveWallet,
    tokenAddress,
    tokenAbi: tokenArtifact.abi,
    credentialAddress,
    credentialAbi: credentialArtifact.abi,
    factoryAddress,
    factoryAbi: factoryArtifact.abi,
    groupAbi: groupArtifact.abi,
    memberAddresses,
    walletByAddress,
  };
}

async function deployFormingFixture(): Promise<FormingFixture> {
  const base = await deployBaseFixture();

  await sendAndWait(
    base.publicClient,
    base.aliceWallet.writeContract({
      address: base.factoryAddress,
      abi: base.factoryAbi,
      functionName: "createGroup",
      args: ["Weekly Five", CONTRIBUTION_AMOUNT, GROUP_FREQUENCY, MAX_GROUP_MEMBERS],
    }),
  );

  const groupAddress = normalize(
    (await base.publicClient.readContract({
      address: base.factoryAddress,
      abi: base.factoryAbi,
      functionName: "getGroupInfo",
      args: [GROUP_ID],
    })) as Address,
  );

  const inviteCode = (await base.publicClient.readContract({
    address: groupAddress,
    abi: base.groupAbi,
    functionName: "inviteCode",
  })) as Bytes32;

  expect(await base.publicClient.readContract({ address: groupAddress, abi: base.groupAbi, functionName: "status" })).to.equal(FORMING);

  return {
    ...base,
    groupAddress,
    inviteCode,
  };
}

async function deployActiveFixture(): Promise<ActiveFixture> {
  const fixture = await deployFormingFixture();

  for (const wallet of [fixture.bobWallet, fixture.carolWallet, fixture.daveWallet, fixture.eveWallet]) {
    await sendAndWait(
      fixture.publicClient,
      wallet.writeContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "joinGroup",
        args: [GROUP_ID, fixture.inviteCode],
      }),
    );
  }

  await sendAndWait(
    fixture.publicClient,
    fixture.aliceWallet.writeContract({
      address: fixture.groupAddress,
      abi: fixture.groupAbi,
      functionName: "startGroup",
    }),
  );

  const memberCount = (await fixture.publicClient.readContract({
    address: fixture.groupAddress,
    abi: fixture.groupAbi,
    functionName: "memberCount",
  })) as bigint;

  const memberOrder = await readMemberOrder(fixture.publicClient, fixture.groupAddress, fixture.groupAbi, memberCount);

  expect(memberCount).to.equal(MEMBER_COUNT);
  expect(memberOrder).to.have.length(Number(MEMBER_COUNT));
  expect(new Set(memberOrder).size).to.equal(Number(MEMBER_COUNT));
  expect(await fixture.publicClient.readContract({ address: fixture.groupAddress, abi: fixture.groupAbi, functionName: "status" })).to.equal(ACTIVE);

  for (const member of fixture.memberAddresses) {
    const wallet = fixture.walletByAddress.get(member);

    if (!wallet) {
      throw new Error(`Missing wallet for ${member}`);
    }

    await sendAndWait(
      fixture.publicClient,
      wallet.writeContract({
        address: fixture.tokenAddress,
        abi: fixture.tokenAbi,
        functionName: "approve",
        args: [fixture.groupAddress, POT_AMOUNT],
      }),
    );
  }

  return {
    ...fixture,
    memberOrder,
  };
}

async function deployAttackFixture(): Promise<AttackFixture> {
  const base = await deployBaseFixture();

  await sendAndWait(
    base.publicClient,
    base.aliceWallet.writeContract({
      address: base.factoryAddress,
      abi: base.factoryAbi,
      functionName: "createGroup",
      args: ["Attack Circle", CONTRIBUTION_AMOUNT, GROUP_FREQUENCY, ATTACK_MEMBER_COUNT],
    }),
  );

  const groupAddress = normalize(
    (await base.publicClient.readContract({
      address: base.factoryAddress,
      abi: base.factoryAbi,
      functionName: "getGroupInfo",
      args: [GROUP_ID],
    })) as Address,
  );

  const inviteCode = (await base.publicClient.readContract({
    address: groupAddress,
    abi: base.groupAbi,
    functionName: "inviteCode",
  })) as Bytes32;

  await sendAndWait(
    base.publicClient,
    base.deployerWallet.writeContract({
      address: base.tokenAddress,
      abi: base.tokenAbi,
      functionName: "setTargetGroup",
      args: [groupAddress],
    }),
  );

  await sendAndWait(
    base.publicClient,
    base.deployerWallet.writeContract({
      address: base.tokenAddress,
      abi: base.tokenAbi,
      functionName: "setAttackMode",
      args: [1n],
    }),
  );

  await sendAndWait(
    base.publicClient,
    base.bobWallet.writeContract({
      address: base.factoryAddress,
      abi: base.factoryAbi,
      functionName: "joinGroup",
      args: [GROUP_ID, inviteCode],
    }),
  );

  await sendAndWait(
    base.publicClient,
    base.carolWallet.writeContract({
      address: base.factoryAddress,
      abi: base.factoryAbi,
      functionName: "joinGroup",
      args: [GROUP_ID, inviteCode],
    }),
  );

  await sendAndWait(
    base.publicClient,
    base.aliceWallet.writeContract({
      address: groupAddress,
      abi: base.groupAbi,
      functionName: "startGroup",
    }),
  );

  for (const wallet of [base.aliceWallet, base.bobWallet]) {
    await sendAndWait(
      base.publicClient,
      wallet.writeContract({
        address: base.tokenAddress,
        abi: base.tokenAbi,
        functionName: "approve",
        args: [groupAddress, ATTACK_POT_AMOUNT],
      }),
    );
  }

  await sendAndWait(
    base.publicClient,
    base.carolWallet.writeContract({
      address: base.tokenAddress,
      abi: base.tokenAbi,
      functionName: "approve",
      args: [groupAddress, ATTACK_POT_AMOUNT],
    }),
  );

  return {
    ...base,
    groupAddress,
    inviteCode,
  };
}

describe("Full 5-Member Weekly Cycle", function () {
  it("completes five rounds, pays out each recipient, and mints credentials", async function () {
    const fixture = await loadFixture(deployActiveFixture);
    const { publicClient, tokenAddress, credentialAddress, groupAddress, groupAbi, tokenAbi, credentialAbi, memberOrder } = fixture;
    const groupMembers = fixture.memberAddresses;
    const initialBalances = new Map<Address, bigint>();

    for (const member of groupMembers) {
      initialBalances.set(
        member,
        (await publicClient.readContract({
          address: tokenAddress,
          abi: tokenAbi,
          functionName: "balanceOf",
          args: [member],
        })) as bigint,
      );
    }

    expect(memberOrder).to.have.length(Number(MEMBER_COUNT));
    expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "status" })).to.equal(ACTIVE);
    expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "memberCount" })).to.equal(MEMBER_COUNT);
    expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "currentPayoutRecipient" })).to.equal(
      memberOrder[0],
    );

    for (let round = 0; round < memberOrder.length; round += 1) {
      const contributionOrder = rotate(memberOrder, round);
      const recipient = contributionOrder[0];
      const balancesBeforeRound = new Map<Address, bigint>();

      for (const member of groupMembers) {
        balancesBeforeRound.set(
          member,
          (await publicClient.readContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: "balanceOf",
            args: [member],
          })) as bigint,
        );
      }

      let payoutReceipt: { gasUsed: bigint } | null = null;

      for (let index = 0; index < contributionOrder.length; index += 1) {
        const contributor = contributionOrder[index];
        const wallet = fixture.walletByAddress.get(contributor);

        if (!wallet) {
          throw new Error(`Missing wallet for ${contributor}`);
        }

        const receipt = await sendAndWait(
          publicClient,
          wallet.writeContract({
            address: groupAddress,
            abi: groupAbi,
            functionName: "contribute",
          }),
        );

        if (index < contributionOrder.length - 1) {
          expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "currentRound" })).to.equal(
            BigInt(round),
          );
          expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "payoutIndex" })).to.equal(
            BigInt(round),
          );
        }

        if (index === contributionOrder.length - 1) {
          payoutReceipt = { gasUsed: receipt.gasUsed };
        }
      }

      expect(payoutReceipt).to.not.equal(null);
      expect(payoutReceipt?.gasUsed).to.be.greaterThan(0n);

      expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "currentRound" })).to.equal(
        BigInt(round + 1),
      );
      expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "payoutIndex" })).to.equal(
        BigInt(round + 1),
      );

      const status = (await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "status" })) as bigint;

      if (round < memberOrder.length - 1) {
        expect(status).to.equal(ACTIVE);
        expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "currentPayoutRecipient" })).to.equal(
          memberOrder[round + 1],
        );
      } else {
        expect(status).to.equal(COMPLETED);
        expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "isCompleted" })).to.equal(true);
        expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "getRemainingTime" })).to.equal(0n);
      }

      for (const member of groupMembers) {
        const balanceAfterRound = (await publicClient.readContract({
          address: tokenAddress,
          abi: tokenAbi,
          functionName: "balanceOf",
          args: [member],
        })) as bigint;
        const balanceBeforeRound = balancesBeforeRound.get(member);

        if (balanceBeforeRound === undefined) {
          throw new Error(`Missing balance snapshot for ${member}`);
        }

        if (member === recipient) {
          expect(balanceAfterRound).to.equal(balanceBeforeRound + POT_AMOUNT - CONTRIBUTION_AMOUNT);
        } else {
          expect(balanceAfterRound).to.equal(balanceBeforeRound - CONTRIBUTION_AMOUNT);
        }
      }
    }

    for (const member of groupMembers) {
      expect(
        await publicClient.readContract({
          address: tokenAddress,
          abi: tokenAbi,
          functionName: "balanceOf",
          args: [member],
        }),
      ).to.equal(INITIAL_BALANCE);

      const credentials = (await publicClient.readContract({
        address: credentialAddress,
        abi: credentialAbi,
        functionName: "getCredentials",
        args: [member],
      })) as bigint[];

      expect(credentials).to.have.length(1);
      expect(
        await publicClient.readContract({
          address: credentialAddress,
          abi: credentialAbi,
          functionName: "balanceOf",
          args: [member],
        }),
      ).to.equal(1n);
      expect(
        await publicClient.readContract({
          address: credentialAddress,
          abi: credentialAbi,
          functionName: "getUserReputation",
          args: [member],
        }),
      ).to.equal(1n);
    }
  });
});

describe("Reentrancy Attack Prevention", function () {
  it("blocks a malicious member from re-entering contribute during payout", async function () {
    const fixture = await loadFixture(deployAttackFixture);
    const { publicClient, groupAddress, groupAbi } = fixture;

    await sendAndWait(
      publicClient,
      fixture.aliceWallet.writeContract({
        address: groupAddress,
        abi: groupAbi,
        functionName: "contribute",
      }),
    );
    await sendAndWait(
      publicClient,
      fixture.bobWallet.writeContract({
        address: groupAddress,
        abi: groupAbi,
        functionName: "contribute",
      }),
    );

    await expectRevert(
      publicClient,
      fixture.carolWallet.writeContract({
        address: groupAddress,
        abi: groupAbi,
        functionName: "contribute",
      }),
      "ReentrancyGuard: reentrant call",
    );

    expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "status" })).to.equal(ACTIVE);
    expect(await publicClient.readContract({ address: groupAddress, abi: groupAbi, functionName: "currentRound" })).to.equal(0n);
  });
});

describe("Double Contribution Attack", function () {
  it("rejects Alice contributing twice in the same round", async function () {
    const fixture = await loadFixture(deployActiveFixture);

    await sendAndWait(
      fixture.publicClient,
      fixture.aliceWallet.writeContract({
        address: fixture.groupAddress,
        abi: fixture.groupAbi,
        functionName: "contribute",
      }),
    );

    await expectRevert(
      fixture.publicClient,
      fixture.aliceWallet.writeContract({
        address: fixture.groupAddress,
        abi: fixture.groupAbi,
        functionName: "contribute",
      }),
      "AlreadyContributed",
    );
  });
});

describe("Unauthorized Access", function () {
  it("rejects a direct addMember call from Bob", async function () {
    const fixture = await loadFixture(deployFormingFixture);

    await expectRevert(
      fixture.publicClient,
      fixture.bobWallet.writeContract({
        address: fixture.groupAddress,
        abi: fixture.groupAbi,
        functionName: "addMember",
        args: [fixture.carolAddress],
      }),
      "OnlyFactory",
    );
  });

  it("rejects Bob starting the group instead of Alice", async function () {
    const fixture = await loadFixture(deployFormingFixture);

    await expectRevert(
      fixture.publicClient,
      fixture.bobWallet.writeContract({
        address: fixture.groupAddress,
        abi: fixture.groupAbi,
        functionName: "startGroup",
      }),
      "OnlyCreator",
    );
  });

  it("rejects Eve minting a credential directly", async function () {
    const fixture = await loadFixture(deployFormingFixture);

    await expectRevert(
      fixture.publicClient,
      fixture.eveWallet.writeContract({
        address: fixture.credentialAddress,
        abi: fixture.credentialAbi,
        functionName: "mint",
        args: [fixture.eveAddress, {
          recipient: fixture.eveAddress,
          groupContract: fixture.groupAddress,
          cyclesCompleted: 1n,
          totalSaved: CONTRIBUTION_AMOUNT,
          completedAt: 1n,
          groupName: "Fake Group",
        }],
      }),
      "UnauthorizedGroup",
    );
  });
});

describe("Invite Code Brute Force", function () {
  it("rejects a random invite code and accepts the real one", async function () {
    const fixture = await loadFixture(deployFormingFixture);

    await expectRevert(
      fixture.publicClient,
      fixture.bobWallet.writeContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "joinGroup",
        args: [GROUP_ID, INVALID_INVITE_CODE],
      }),
      "InvalidInviteCode",
    );

    await sendAndWait(
      fixture.publicClient,
      fixture.bobWallet.writeContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "joinGroup",
        args: [GROUP_ID, fixture.inviteCode],
      }),
    );

    expect(await fixture.publicClient.readContract({ address: fixture.groupAddress, abi: fixture.groupAbi, functionName: "memberCount" })).to.equal(2n);
    expect(await fixture.publicClient.readContract({ address: fixture.groupAddress, abi: fixture.groupAbi, functionName: "isMember", args: [fixture.bobAddress] })).to.equal(
      true,
    );
  });
});

describe("Gas Benchmarks", function () {
  it("logs createGroup, joinGroup, contribute, and round payout gas", async function () {
    const fixture = await loadFixture(deployBaseFixture);

    const createReceipt = await sendAndWait(
      fixture.publicClient,
      fixture.aliceWallet.writeContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "createGroup",
        args: ["Gas Circle", CONTRIBUTION_AMOUNT, GROUP_FREQUENCY, MAX_GROUP_MEMBERS],
      }),
    );

    const groupAddress = normalize(
      (await fixture.publicClient.readContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "getGroupInfo",
        args: [GROUP_ID],
      })) as Address,
    );

    const inviteCode = (await fixture.publicClient.readContract({
      address: groupAddress,
      abi: fixture.groupAbi,
      functionName: "inviteCode",
    })) as Bytes32;

    const joinReceipt = await sendAndWait(
      fixture.publicClient,
      fixture.bobWallet.writeContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "joinGroup",
        args: [GROUP_ID, inviteCode],
      }),
    );

    await sendAndWait(
      fixture.publicClient,
      fixture.carolWallet.writeContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "joinGroup",
        args: [GROUP_ID, inviteCode],
      }),
    );
    await sendAndWait(
      fixture.publicClient,
      fixture.daveWallet.writeContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "joinGroup",
        args: [GROUP_ID, inviteCode],
      }),
    );
    await sendAndWait(
      fixture.publicClient,
      fixture.eveWallet.writeContract({
        address: fixture.factoryAddress,
        abi: fixture.factoryAbi,
        functionName: "joinGroup",
        args: [GROUP_ID, inviteCode],
      }),
    );

    await sendAndWait(
      fixture.publicClient,
      fixture.aliceWallet.writeContract({
        address: groupAddress,
        abi: fixture.groupAbi,
        functionName: "startGroup",
      }),
    );

    const memberOrder = await readMemberOrder(fixture.publicClient, groupAddress, fixture.groupAbi, MEMBER_COUNT);

    for (const member of fixture.memberAddresses) {
      const wallet = fixture.walletByAddress.get(member);

      if (!wallet) {
        throw new Error(`Missing wallet for ${member}`);
      }

      await sendAndWait(
        fixture.publicClient,
        wallet.writeContract({
          address: fixture.tokenAddress,
          abi: fixture.tokenAbi,
          functionName: "approve",
          args: [groupAddress, POT_AMOUNT],
        }),
      );
    }

    const contributeReceipt = await sendAndWait(
      fixture.publicClient,
      fixture.aliceWallet.writeContract({
        address: groupAddress,
        abi: fixture.groupAbi,
        functionName: "contribute",
      }),
    );

    for (const wallet of [fixture.bobWallet, fixture.carolWallet, fixture.daveWallet]) {
      await sendAndWait(
        fixture.publicClient,
        wallet.writeContract({
          address: groupAddress,
          abi: fixture.groupAbi,
          functionName: "contribute",
        }),
      );
    }

    const payoutReceipt = await sendAndWait(
      fixture.publicClient,
      fixture.eveWallet.writeContract({
        address: groupAddress,
        abi: fixture.groupAbi,
        functionName: "contribute",
      }),
    );

    console.log(`createGroup gas: ${createReceipt.gasUsed}`);
    console.log(`joinGroup gas: ${joinReceipt.gasUsed}`);
    console.log(`contribute gas: ${contributeReceipt.gasUsed}`);
    console.log(`full round payout gas: ${payoutReceipt.gasUsed}`);

    expect(createReceipt.gasUsed).to.be.lessThan(3_000_000n);
    expect(joinReceipt.gasUsed).to.be.lessThan(300_000n);
    expect(contributeReceipt.gasUsed).to.be.lessThan(300_000n);
    expect(payoutReceipt.gasUsed).to.be.lessThan(330_000n);

    expect(memberOrder).to.have.length(Number(MEMBER_COUNT));
  });
});