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

describe("full savings cycle", function () {
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
      args: ["Full Cycle Circle", parseUnits("1", 18), 7n, 3n],
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

    return {
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
    };
  }

  it("completes a full three-cycle rotation and marks the group complete", async function () {
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
    } = await deployFixture();

    const wallets = [deployerWallet, aliceWallet, bobWallet];
    const members = [deployer, alice, bob] as const;
    const expectedRecipients = [deployer, alice, bob] as const;

    for (let cycle = 0; cycle < expectedRecipients.length; cycle++) {
      for (const walletClient of wallets) {
        await walletClient.writeContract({
          address: tokenAddress,
          abi: mockArtifact.abi,
          functionName: "approve",
          args: [groupAddress, parseUnits("1", 18)],
        });
      }

      for (const walletClient of wallets) {
        await walletClient.writeContract({
          address: groupAddress,
          abi: groupArtifact.abi,
          functionName: "contribute",
        });
      }

      await network.provider.request({ method: "evm_increaseTime", params: [7 * 24 * 60 * 60] });
      await network.provider.request({ method: "evm_mine", params: [] });

      const payoutReady = await publicClient.readContract({
        address: groupAddress,
        abi: groupArtifact.abi,
        functionName: "canExecutePayout",
      });
      expect(payoutReady).to.equal(true);

      const recipient = await publicClient.readContract({
        address: groupAddress,
        abi: groupArtifact.abi,
        functionName: "currentPayoutRecipient",
      });
      expect(String(recipient).toLowerCase()).to.equal(expectedRecipients[cycle].toLowerCase());

      await deployerWallet.writeContract({
        address: groupAddress,
        abi: groupArtifact.abi,
        functionName: "executePayout",
      });
    }

    const currentCycle = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "currentCycle",
    });
    const completed = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "isCompleted",
    });

    expect(currentCycle).to.equal(3n);
    expect(completed).to.equal(true);

    for (const member of members) {
      const balance = await publicClient.readContract({
        address: tokenAddress,
        abi: mockArtifact.abi,
        functionName: "balanceOf",
        args: [member],
      });
      expect(balance).to.equal(parseUnits("10", 18));
    }
  });
});
