import { execFile } from "child_process";
import { config as loadEnv } from "dotenv";
import hre from "hardhat";
import { promisify } from "util";
import {
  assertCeloScanApiKey,
  assertCorrectNetwork,
  CONTRACTS_ROOT,
  readDeploymentRecord,
  resolveNetworkConfig,
  type DeploymentRecord,
} from "./alfajores";

loadEnv();

const execFileAsync = promisify(execFile);

type VerificationTarget = {
  address: string;
  constructorArguments: string[];
  label: string;
};

function isAlreadyVerifiedError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const anyError = error as { message?: string; stdout?: string; stderr?: string };
  const combined = `${anyError.message ?? ""}\n${anyError.stdout ?? ""}\n${anyError.stderr ?? ""}`;
  return /already verified|contract source code already verified/i.test(combined);
}

async function runHardhatVerify(networkName: string, target: VerificationTarget) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const args = ["hardhat", "verify", "--network", networkName, target.address, ...target.constructorArguments];

  try {
    const result = await execFileAsync(command, args, {
      cwd: CONTRACTS_ROOT,
      maxBuffer: 10 * 1024 * 1024,
    });

    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    if (output.length > 0) {
      console.log(output);
    }

    console.log(`Verified ${target.label} at ${target.address}`);
  } catch (error) {
    if (isAlreadyVerifiedError(error)) {
      console.log(`${target.label} at ${target.address} is already verified.`);
      return;
    }

    throw error;
  }
}

async function main() {
  assertCeloScanApiKey();

  const networkConfig = await assertCorrectNetwork(hre, hre.network.name);
  const deployment = (await readDeploymentRecord(networkConfig.name)) as DeploymentRecord;

  if (deployment.network !== networkConfig.name) {
    throw new Error(`Deployment file ${resolveNetworkConfig(networkConfig.name).deploymentFile} does not match the active network.`);
  }

  const targets: VerificationTarget[] = [
    {
      address: deployment.credential,
      constructorArguments: [],
      label: "AjoCredential",
    },
    {
      address: deployment.factory,
      constructorArguments: [deployment.cUSD, deployment.credential],
      label: "AjoGroupFactory",
    },
  ];

  console.log(`Verifying contracts on ${networkConfig.name} using ${networkConfig.deploymentFile}`);
  for (const target of targets) {
    await runHardhatVerify(networkConfig.name, target);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
