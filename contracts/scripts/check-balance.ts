import { config as loadEnv } from "dotenv";
import hre from "hardhat";
import { formatEther } from "ethers";
import {
  assertCorrectNetwork,
  assertPrivateKey,
  getDeployerSigner,
  resolveNetworkConfig,
} from "./alfajores.js";

loadEnv();

async function main() {
  assertPrivateKey();
  const networkConfig = await assertCorrectNetwork(hre, "alfajores");
  const { deployerAddress } = await getDeployerSigner(hre);
  const nativeBalance = await hre.ethers.provider.getBalance(deployerAddress);

  const cUsdContract = new hre.ethers.Contract(networkConfig.cUSDAddress, ["function balanceOf(address) view returns (uint256)"], hre.ethers.provider);
  const cUsdBalance = (await cUsdContract.balanceOf(deployerAddress)) as bigint;

  console.log(`Network: ${networkConfig.name} (${networkConfig.chainId})`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`CELO balance: ${formatEther(nativeBalance)} CELO`);
  console.log(`cUSD balance: ${formatEther(cUsdBalance)} cUSD`);
  console.log(`Deployment file: ${resolveNetworkConfig(networkConfig.name).deploymentFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});