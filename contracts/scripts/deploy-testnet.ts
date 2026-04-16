import { config as loadEnv } from "dotenv";

loadEnv();

async function main() {
  console.log("Preparing an Alfajores deployment for AjoChain.");
  console.log("Use the testnet RPC, fund the deployer wallet, then deploy the factory before the savings groups.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
