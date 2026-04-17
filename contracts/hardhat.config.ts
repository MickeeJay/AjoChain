import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import type { HardhatUserConfig } from "hardhat/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const CELOSCAN_API_KEY = process.env.CELOSCAN_API_KEY ?? "";
const REPORT_GAS = Boolean(process.env.REPORT_GAS);

type HardhatConfigWithNamedAccounts = HardhatUserConfig & {
  namedAccounts: {
    deployer: {
      default: number;
    };
  };
};

const config: HardhatConfigWithNamedAccounts = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      chainId: 44787,
      gas: "auto",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    celo: {
      url: "https://forno.celo.org",
      chainId: 42220,
      gas: "auto",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      celo: CELOSCAN_API_KEY,
      alfajores: CELOSCAN_API_KEY,
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  gasReporter: REPORT_GAS
    ? {
        enabled: true,
      }
    : {
        enabled: false,
      },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
