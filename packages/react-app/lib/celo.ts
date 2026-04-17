import { defineChain } from "viem";

const celoMainnetRpcUrl = process.env.NEXT_PUBLIC_CELO_RPC_URL ?? "https://forno.celo.org";
const celoAlfajoresRpcUrl = process.env.NEXT_PUBLIC_ALFAJORES_RPC_URL ?? "https://alfajores-forno.celo-testnet.org";

export const celoMainnet = defineChain({
  id: 42220,
  name: "Celo",
  network: "celo",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [celoMainnetRpcUrl],
    },
    public: {
      http: [celoMainnetRpcUrl],
    },
  },
});

export const celoAlfajores = defineChain({
  id: 44787,
  name: "Alfajores",
  network: "alfajores",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [celoAlfajoresRpcUrl],
    },
    public: {
      http: [celoAlfajoresRpcUrl],
    },
  },
});
