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

describe("AjoSavingsGroup", function () {
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

    await deployerWallet.writeContract({
      address: tokenAddress,
      abi: mockArtifact.abi,
      functionName: "mint",
      args: [deployer, parseUnits("10", 18)],
    });
    await deployerWallet.writeContract({
      address: tokenAddress,
      abi: mockArtifact.abi,
      functionName: "mint",
      args: [alice, parseUnits("10", 18)],
    });
    await deployerWallet.writeContract({
      address: tokenAddress,
      abi: mockArtifact.abi,
      functionName: "mint",
      args: [bob, parseUnits("10", 18)],
    });

    const createHash = await deployerWallet.writeContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "createGroup",
      args: ["Neighborhood Circle", parseUnits("1", 18), 7n, 3n],
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

    const recordedCusd = await publicClient.readContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "cUSDToken",
    });
    expect(String(recordedCusd).toLowerCase()).to.equal(tokenAddress.toLowerCase());

    return {
      publicClient,
      deployerWallet,
      aliceWallet,
      bobWallet,
      tokenAddress,
      groupAddress,
      mockArtifact,
      deployer,
      alice,
      bob,
      inviteCode,
      factoryAddress,
      groupArtifact,
      factoryArtifact,
    };
  }

  async function activateGroup(fixture: Awaited<ReturnType<typeof deployFixture>>) {
    const { publicClient, deployerWallet, aliceWallet, bobWallet, factoryAddress, factoryArtifact, inviteCode, groupAddress, groupArtifact } = fixture;

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

    const startHash = await deployerWallet.writeContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "startGroup",
    });
    await publicClient.waitForTransactionReceipt({ hash: startHash });

    const memberCount = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "memberCount",
    });

    const memberOrder: `0x${string}`[] = [];
    for (let index = 0n; index < memberCount; index++) {
      const member = (await publicClient.readContract({
        address: groupAddress,
        abi: groupArtifact.abi,
        functionName: "memberOrder",
        args: [index],
      })) as `0x${string}`;

      memberOrder.push(member);
    }

    return memberOrder;
  }

  it("starts the group and auto-executes the first payout", async function () {
    const fixture = await deployFixture();
    const {
      publicClient,
      deployerWallet,
      aliceWallet,
      bobWallet,
      tokenAddress,
      groupAddress,
      mockArtifact,
      groupArtifact,
      deployer,
      alice,
      bob,
    } = fixture;

    const memberOrder = await activateGroup(fixture);
    const firstRecipient = memberOrder[0];

    const remainingTime = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "getRemainingTime",
    });
    expect(remainingTime).to.be.greaterThan(0n);

    for (const account of [deployer, alice, bob]) {
      const walletClient = account === deployer ? deployerWallet : account === alice ? aliceWallet : bobWallet;
      await walletClient.writeContract({
        address: tokenAddress,
        abi: mockArtifact.abi,
        functionName: "approve",
        args: [groupAddress, parseUnits("1", 18)],
      });
      await walletClient.writeContract({
        address: groupAddress,
        abi: groupArtifact.abi,
        functionName: "contribute",
      });
    }

    const payoutRecipient = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "currentPayoutRecipient",
    });
    expect(String(payoutRecipient).toLowerCase()).to.equal(memberOrder[1].toLowerCase());

    const currentRound = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "currentRound",
    });
    const payoutIndex = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "payoutIndex",
    });
    const status = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "status",
    });

    expect(currentRound).to.equal(1n);
    expect(payoutIndex).to.equal(1n);
    expect(status).to.equal(1n);

    const deployerBalance = await publicClient.readContract({
      address: tokenAddress,
      abi: mockArtifact.abi,
      functionName: "balanceOf",
      args: [deployer],
    });
    const aliceBalance = await publicClient.readContract({
      address: tokenAddress,
      abi: mockArtifact.abi,
      functionName: "balanceOf",
      args: [alice],
    });
    const bobBalance = await publicClient.readContract({
      address: tokenAddress,
      abi: mockArtifact.abi,
      functionName: "balanceOf",
      args: [bob],
    });

    const balanceByMember = new Map<`0x${string}`, bigint>([
      [deployer, deployerBalance as bigint],
      [alice, aliceBalance as bigint],
      [bob, bobBalance as bigint],
    ]);

    for (const [memberAddress, balance] of balanceByMember.entries()) {
      if (memberAddress.toLowerCase() === firstRecipient.toLowerCase()) {
        expect(balance).to.equal(parseUnits("12", 18));
      } else {
        expect(balance).to.equal(parseUnits("9", 18));
      }
    }
  });
});
