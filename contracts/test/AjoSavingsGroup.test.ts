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

  it("allows members to contribute and rotate the payout", async function () {
    const {
      publicClient,
      deployerWallet,
      aliceWallet,
      bobWallet,
      tokenAddress,
      groupAddress,
      mockArtifact,
      groupArtifact,
      factoryArtifact,
      factoryAddress,
      deployer,
      alice,
      bob,
      inviteCode,
    } = await deployFixture();

    const groupId = 0n;

    const aliceJoinHash = await aliceWallet.writeContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "joinGroup",
      args: [groupId, inviteCode],
    });
    await publicClient.waitForTransactionReceipt({ hash: aliceJoinHash });

    const bobJoinHash = await bobWallet.writeContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "joinGroup",
      args: [groupId, inviteCode],
    });
    await publicClient.waitForTransactionReceipt({ hash: bobJoinHash });

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

    await network.provider.request({ method: "evm_increaseTime", params: [7 * 24 * 60 * 60] });
    await network.provider.request({ method: "evm_mine", params: [] });

    const ready = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "canExecutePayout",
    });
    expect(ready).to.equal(true);

    const payoutRecipient = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "currentPayoutRecipient",
    });
    expect(String(payoutRecipient).toLowerCase()).to.equal(deployer.toLowerCase());

    await deployerWallet.writeContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "executePayout",
    });

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

    expect(deployerBalance).to.equal(parseUnits("12", 18));
    expect(aliceBalance).to.equal(parseUnits("9", 18));
    expect(bobBalance).to.equal(parseUnits("9", 18));
  });
});
