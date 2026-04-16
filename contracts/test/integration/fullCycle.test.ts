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

    const credentialArtifact = await artifacts.readArtifact("AjoCredential");
    const credentialHash = await deployerWallet.deployContract({
      abi: credentialArtifact.abi,
      bytecode: credentialArtifact.bytecode as `0x${string}`,
    });
    const credentialReceipt = await publicClient.waitForTransactionReceipt({ hash: credentialHash });
    const credentialAddress = credentialReceipt.contractAddress as `0x${string}`;

    const factoryArtifact = await artifacts.readArtifact("AjoGroupFactory");
    const factoryHash = await deployerWallet.deployContract({
      abi: factoryArtifact.abi,
      bytecode: factoryArtifact.bytecode as `0x${string}`,
      args: [tokenAddress, credentialAddress],
    });
    const factoryReceipt = await publicClient.waitForTransactionReceipt({ hash: factoryHash });
    const factoryAddress = factoryReceipt.contractAddress as `0x${string}`;

    const ownershipHash = await deployerWallet.writeContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "transferOwnership",
      args: [factoryAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash: ownershipHash });

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

    const isAuthorized = await publicClient.readContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "authorizedGroups",
      args: [groupAddress],
    });
    expect(isAuthorized).to.equal(true);

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
      credentialAddress,
      groupAddress,
      mockArtifact,
      credentialArtifact,
      groupArtifact,
      factoryAddress,
      factoryArtifact,
      inviteCode,
      deployer,
      alice,
      bob,
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

  it("completes a full three-cycle rotation and marks the group complete", async function () {
    const fixture = await deployFixture();
    const {
      publicClient,
      deployerWallet,
      aliceWallet,
      bobWallet,
      tokenAddress,
      credentialAddress,
      groupAddress,
      mockArtifact,
      credentialArtifact,
      groupArtifact,
      deployer,
      alice,
      bob,
      factoryAddress,
    } = fixture;

    const memberOrder = await activateGroup(fixture);
    const wallets = [deployerWallet, aliceWallet, bobWallet];
    const members = [deployer, alice, bob] as const;

    for (let cycle = 0; cycle < memberOrder.length; cycle++) {
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

      expect(currentRound).to.equal(BigInt(cycle + 1));
      expect(payoutIndex).to.equal(BigInt(cycle + 1));

      if (cycle + 1 < memberOrder.length) {
        const nextRecipient = await publicClient.readContract({
          address: groupAddress,
          abi: groupArtifact.abi,
          functionName: "currentPayoutRecipient",
        });

        expect(String(nextRecipient).toLowerCase()).to.equal(memberOrder[cycle + 1].toLowerCase());
      }
    }

    const status = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "status",
    });
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
    const remainingTime = await publicClient.readContract({
      address: groupAddress,
      abi: groupArtifact.abi,
      functionName: "getRemainingTime",
    });

    expect(status).to.equal(2n);
    expect(currentRound).to.equal(3n);
    expect(payoutIndex).to.equal(3n);
    expect(remainingTime).to.equal(0n);

    const credentialOwner = await publicClient.readContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "owner",
    });
      expect(String(credentialOwner).toLowerCase()).to.equal(factoryAddress.toLowerCase());

    const walletByMember = new Map<`0x${string}`, typeof deployerWallet>([
      [deployer, deployerWallet],
      [alice, aliceWallet],
      [bob, bobWallet],
    ]);

    for (let index = 0; index < memberOrder.length; index++) {
      const recipient = memberOrder[index];
      const tokens = await publicClient.readContract({
        address: credentialAddress,
        abi: credentialArtifact.abi,
        functionName: "getCredentials",
        args: [recipient],
      });

      expect(tokens).to.deep.equal([BigInt(index + 1)]);

      const reputation = await publicClient.readContract({
        address: credentialAddress,
        abi: credentialArtifact.abi,
        functionName: "getUserReputation",
        args: [recipient],
      });
      expect(reputation).to.equal(1n);

      const tokenUri = await publicClient.readContract({
        address: credentialAddress,
        abi: credentialArtifact.abi,
        functionName: "tokenURI",
        args: [BigInt(index + 1)],
      });
      expect(String(tokenUri)).to.include("data:application/json;base64,");

      const walletClient = walletByMember.get(recipient);
      if (!walletClient) {
        continue;
      }

      let transferFailed = false;
      try {
        await walletClient.writeContract({
          address: credentialAddress,
          abi: credentialArtifact.abi,
          functionName: "transferFrom",
          args: [recipient, deployer, BigInt(index + 1)],
        });
      } catch {
        transferFailed = true;
      }

      expect(transferFailed).to.equal(true);
    }

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