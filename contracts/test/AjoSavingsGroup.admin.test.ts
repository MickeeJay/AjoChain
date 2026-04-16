import { expect } from "chai";
import { artifacts, network } from "hardhat";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  parseUnits,
} from "viem";

const hardhatChain = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

describe("AjoSavingsGroup admin flows", function () {
  async function deployFixture() {
    const accounts = (await network.provider.request({ method: "eth_accounts" })) as `0x${string}`[];
    const [deployer, alice, bob] = accounts;
    const transport = custom(network.provider as never);
    const publicClient = createPublicClient({ chain: hardhatChain, transport });
    const deployerWallet = createWalletClient({ chain: hardhatChain, transport, account: deployer });
    const aliceWallet = createWalletClient({ chain: hardhatChain, transport, account: alice });
    const bobWallet = createWalletClient({ chain: hardhatChain, transport, account: bob });

    const mockArtifact = await artifacts.readArtifact("MockCUSD");
    const mockHash = await deployerWallet.deployContract({
      abi: mockArtifact.abi,
      bytecode: mockArtifact.bytecode as `0x${string}`,
    });
    const mockReceipt = await publicClient.waitForTransactionReceipt({ hash: mockHash });
    const tokenAddress = mockReceipt.contractAddress as `0x${string}`;

    const factoryArtifact = await artifacts.readArtifact("AjoGroupFactory");
    const factoryHash = await deployerWallet.deployContract({
      abi: factoryArtifact.abi,
      bytecode: factoryArtifact.bytecode as `0x${string}`,
      args: [tokenAddress],
    });
    const factoryReceipt = await publicClient.waitForTransactionReceipt({ hash: factoryHash });
    const factoryAddress = factoryReceipt.contractAddress as `0x${string}`;

    for (const account of [deployer, alice, bob]) {
      await deployerWallet.writeContract({
        address: tokenAddress,
        abi: mockArtifact.abi,
        functionName: "mint",
        args: [account, parseUnits("10", 18)],
      });
    }

    const createHash = await deployerWallet.writeContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "createGroup",
      args: ["Admin Circle", parseUnits("1", 18), 7n, 3n],
    });
    await publicClient.waitForTransactionReceipt({ hash: createHash });

    const groupAddress = (await publicClient.readContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "getGroupInfo",
      args: [0n],
    })) as `0x${string}`;

    const groupArtifact = await artifacts.readArtifact("AjoSavingsGroup");
    const inviteCode = (await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "inviteCode",
    })) as `0x${string}`;

    return {
      publicClient,
      deployerWallet,
      aliceWallet,
      bobWallet,
      tokenAddress,
      groupAddress,
      groupArtifact,
      factoryAddress,
      factoryArtifact,
      inviteCode,
      deployer,
      alice,
      bob,
    };
  }

  async function joinMembers(fixture: Awaited<ReturnType<typeof deployFixture>>) {
    const { publicClient, aliceWallet, bobWallet, factoryAddress, factoryArtifact, inviteCode } = fixture;

    const aliceJoinHash = await aliceWallet.writeContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "joinGroup",
      args: [0n, inviteCode],
    });
    await publicClient.waitForTransactionReceipt({ hash: aliceJoinHash });

    const bobJoinHash = await bobWallet.writeContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "joinGroup",
      args: [0n, inviteCode],
    });
    await publicClient.waitForTransactionReceipt({ hash: bobJoinHash });
  }

  it("requires a 60 percent vote to pause and resume", async function () {
    const fixture = await deployFixture();
    const { publicClient, deployerWallet, aliceWallet, groupAddress, groupArtifact } = fixture;

    await joinMembers(fixture);

    const startHash = await deployerWallet.writeContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "startGroup",
    });
    await publicClient.waitForTransactionReceipt({ hash: startHash });

    for (const voter of [deployerWallet, aliceWallet]) {
      await voter.writeContract({
        address: groupAddress,
        abi: groupArtifact.abi,
        functionName: "voteOnPause",
        args: [true],
      });
    }

    const pauseHash = await deployerWallet.writeContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "pauseRound",
      args: [true],
    });
    await publicClient.waitForTransactionReceipt({ hash: pauseHash });

    const pausedStatus = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "status",
    });
    expect(pausedStatus).to.equal(3n);

    for (const voter of [deployerWallet, aliceWallet]) {
      await voter.writeContract({
        address: groupAddress,
        abi: groupArtifact.abi,
        functionName: "voteOnPause",
        args: [false],
      });
    }

    const resumeHash = await deployerWallet.writeContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "pauseRound",
      args: [false],
    });
    await publicClient.waitForTransactionReceipt({ hash: resumeHash });

    const activeStatus = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "status",
    });
    expect(activeStatus).to.equal(1n);
  });

  it("allows members to exit while the group is still forming", async function () {
    const fixture = await deployFixture();
    const { publicClient, aliceWallet, groupAddress, groupArtifact, deployer, alice } = fixture;

    await joinMembers(fixture);

    const exitHash = await aliceWallet.writeContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "emergencyExit",
    });
    await publicClient.waitForTransactionReceipt({ hash: exitHash });

    const state = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "getGroupState",
    });

    expect((state as { status: bigint }).status).to.equal(0n);
    expect((state as { remainingTime: bigint }).remainingTime).to.equal(0n);

    const memberCount = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "memberCount",
    });
    const aliceMember = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "isMember",
      args: [alice],
    });
    const deployerMember = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "isMember",
      args: [deployer],
    });

    expect(memberCount).to.equal(2n);
    expect(aliceMember).to.equal(false);
    expect(deployerMember).to.equal(true);
  });
});
