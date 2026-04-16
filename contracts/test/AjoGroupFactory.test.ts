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

describe("AjoGroupFactory", function () {
  async function deployFixture() {
    const accounts = (await network.provider.request({ method: "eth_accounts" })) as `0x${string}`[];
    const deployer = accounts[0];
    const transport = custom(network.provider as never);
    const publicClient = createPublicClient({ chain: hardhatChain, transport });
    const walletClient = createWalletClient({ chain: hardhatChain, transport, account: deployer });

    const mockArtifact = await artifacts.readArtifact("MockCUSD");
    const mockHash = await walletClient.deployContract({
      abi: mockArtifact.abi,
      bytecode: mockArtifact.bytecode as `0x${string}`,
    });
    const mockReceipt = await publicClient.waitForTransactionReceipt({ hash: mockHash });
    const mockAddress = mockReceipt.contractAddress as `0x${string}`;

    const factoryArtifact = await artifacts.readArtifact("AjoGroupFactory");
    const factoryHash = await walletClient.deployContract({
      abi: factoryArtifact.abi,
      bytecode: factoryArtifact.bytecode as `0x${string}`,
    });
    const factoryReceipt = await publicClient.waitForTransactionReceipt({ hash: factoryHash });
    const factoryAddress = factoryReceipt.contractAddress as `0x${string}`;

    return { publicClient, walletClient, mockAddress, factoryAddress, factoryArtifact, mockArtifact, deployer };
  }

  it("creates a new savings group and tracks it in the registry", async function () {
    const { publicClient, walletClient, mockAddress, factoryAddress, factoryArtifact, mockArtifact, deployer } =
      await deployFixture();

    const createHash = await walletClient.writeContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "createGroup",
      args: ["Market Circle", mockAddress, parseUnits("10", 18), 3n, 0n],
    });
    await publicClient.waitForTransactionReceipt({ hash: createHash });

    const totalGroups = await publicClient.readContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "totalGroups",
    });
    expect(totalGroups).to.equal(1n);

    const firstGroup = await publicClient.readContract({
      address: factoryAddress,
      abi: factoryArtifact.abi,
      functionName: "allGroups",
      args: [0n],
    });
    expect(firstGroup).to.match(/^0x[a-fA-F0-9]{40}$/);

    const groupMemberCount = await publicClient.readContract({
      address: firstGroup as `0x${string}`,
      abi: [
        {
          type: "function",
          name: "memberCount",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "uint256" }],
        },
        {
          type: "function",
          name: "isMember",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "bool" }],
        },
      ],
      functionName: "memberCount",
    });
    expect(groupMemberCount).to.equal(1n);

    const isCreatorMember = await publicClient.readContract({
      address: firstGroup as `0x${string}`,
      abi: [
        {
          type: "function",
          name: "isMember",
          stateMutability: "view",
          inputs: [{ name: "account", type: "address" }],
          outputs: [{ name: "", type: "bool" }],
        },
      ],
      functionName: "isMember",
      args: [deployer],
    });
    expect(isCreatorMember).to.equal(true);
  });
});
