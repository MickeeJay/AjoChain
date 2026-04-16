import { config as loadEnv } from "dotenv";

loadEnv();

async function main() {
  console.log("Preparing an Alfajores deployment for AjoChain.");
  console.log("Deploy AjoCredential first, then AjoGroupFactory, then authorize each group contract before the first completion payout.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
