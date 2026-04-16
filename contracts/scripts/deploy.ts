import { config as loadEnv } from "dotenv";

loadEnv();

async function main() {
  const networkName = process.env.HARDHAT_NETWORK ?? "local";
  console.log(`Preparing AjoChain deployment for ${networkName}.`);
  console.log("Deploy AjoGroupFactory first, then wire AjoSavingsGroup instances through the factory.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
