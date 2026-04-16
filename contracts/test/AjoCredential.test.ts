import { expect } from "chai";
import { artifacts, network } from "hardhat";
import { createPublicClient, createWalletClient, custom, defineChain, parseUnits } from "viem";

const hardhatChain = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

describe("AjoCredential", function () {
  async function deployFixture() {
    const accounts = (await network.provider.request({ method: "eth_accounts" })) as `0x${string}`[];
    const [deployer, alice, bob] = accounts;
    const transport = custom(network.provider as never);
    const publicClient = createPublicClient({ chain: hardhatChain, transport });
    const deployerWallet = createWalletClient({ chain: hardhatChain, transport, account: deployer });
    const aliceWallet = createWalletClient({ chain: hardhatChain, transport, account: alice });
    const bobWallet = createWalletClient({ chain: hardhatChain, transport, account: bob });

    const credentialArtifact = await artifacts.readArtifact("AjoCredential");
    const credentialHash = await deployerWallet.deployContract({
      abi: credentialArtifact.abi,
      bytecode: credentialArtifact.bytecode as `0x${string}`,
    });
    const credentialReceipt = await publicClient.waitForTransactionReceipt({ hash: credentialHash });
    const credentialAddress = credentialReceipt.contractAddress as `0x${string}`;

    const mockGroupArtifact = await artifacts.readArtifact("MockCredentialGroup");
    const mockGroupHash = await deployerWallet.deployContract({
      abi: mockGroupArtifact.abi,
      bytecode: mockGroupArtifact.bytecode as `0x${string}`,
      args: [credentialAddress],
    });
    const mockGroupReceipt = await publicClient.waitForTransactionReceipt({ hash: mockGroupHash });
    const mockGroupAddress = mockGroupReceipt.contractAddress as `0x${string}`;

    return {
      publicClient,
      deployerWallet,
      aliceWallet,
      bobWallet,
      credentialAddress,
      credentialArtifact,
      mockGroupAddress,
      mockGroupArtifact,
      deployer,
      alice,
      bob,
    };
  }

  it("mints a soulbound certificate with on-chain metadata", async function () {
    const {
      publicClient,
      deployerWallet,
      aliceWallet,
      credentialAddress,
      credentialArtifact,
      mockGroupAddress,
      mockGroupArtifact,
      alice,
      deployer,
    } = await deployFixture();

    const authorizeHash = await deployerWallet.writeContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "authorizeGroup",
      args: [mockGroupAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash: authorizeHash });

    const completedAt = 1_700_000_000n;
    const mintHash = await deployerWallet.writeContract({
      address: mockGroupAddress,
      abi: mockGroupArtifact.abi,
      functionName: "mintCredential",
      args: [alice, {
        recipient: alice,
        groupContract: mockGroupAddress,
        cyclesCompleted: 3n,
        totalSaved: parseUnits("12", 18),
        completedAt,
        groupName: "Neighborhood Circle",
      }],
    });
    await publicClient.waitForTransactionReceipt({ hash: mintHash });

    const tokenIds = await publicClient.readContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "getCredentials",
      args: [alice],
    });
    expect(tokenIds).to.deep.equal([1n]);

    const reputation = await publicClient.readContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "getUserReputation",
      args: [alice],
    });
    expect(reputation).to.equal(3n);

    const credential = await publicClient.readContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "credentials",
      args: [1n],
    });
    expect((credential as readonly unknown[])[5]).to.equal("Neighborhood Circle");

    const tokenUri = await publicClient.readContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "tokenURI",
      args: [1n],
    });
    const encodedMetadata = String(tokenUri).replace("data:application/json;base64,", "");
    const metadata = JSON.parse(Buffer.from(encodedMetadata, "base64").toString("utf8")) as {
      name: string;
      description: string;
      image: string;
      attributes: Array<{ trait_type: string; value: string | number }>;
    };

    expect(metadata.name).to.equal("AjoChain Savings Certificate");
    expect(metadata.description).to.include("On-chain certificate");
    expect(metadata.image).to.include("data:image/svg+xml;base64,");

    const attributes = new Map(metadata.attributes.map((attribute) => [attribute.trait_type, String(attribute.value)]));
    expect(attributes.get("groupName")).to.equal("Neighborhood Circle");
    expect(attributes.get("cyclesCompleted")).to.equal("3");
    expect(attributes.get("totalSaved")).to.equal(parseUnits("12", 18).toString());
    expect(attributes.get("completedAt")).to.equal(completedAt.toString());

    let transferFailed = false;
    try {
      await aliceWallet.writeContract({
        address: credentialAddress,
        abi: credentialArtifact.abi,
        functionName: "transferFrom",
        args: [alice, deployer, 1n],
      });
    } catch {
      transferFailed = true;
    }

    expect(transferFailed).to.equal(true);
  });

  it("rejects mints before a group is authorized", async function () {
    const { publicClient, deployerWallet, credentialAddress, credentialArtifact, mockGroupAddress, mockGroupArtifact, bob } =
      await deployFixture();

    let failed = false;
    try {
      await deployerWallet.writeContract({
        address: mockGroupAddress,
        abi: mockGroupArtifact.abi,
        functionName: "mintCredential",
        args: [bob, {
          recipient: bob,
          groupContract: mockGroupAddress,
          cyclesCompleted: 1n,
          totalSaved: parseUnits("1", 18),
          completedAt: 1_700_000_000n,
          groupName: "Unauthorized Circle",
        }],
      });
    } catch {
      failed = true;
    }

    expect(failed).to.equal(true);

    const authorized = await publicClient.readContract({
      address: credentialAddress,
      abi: credentialArtifact.abi,
      functionName: "authorizedGroups",
      args: [mockGroupAddress],
    });
    expect(authorized).to.equal(false);
  });
});