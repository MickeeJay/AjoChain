import { config as loadEnv } from "dotenv";

loadEnv();

async function main() {
  console.log("Verify the deployed AjoChain contracts after the bytecode is published.");
  console.log("Pass the contract address, constructor args, and network to your verification workflow.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
