import { defineChain } from "viem";

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
      http: [process.env.NEXT_PUBLIC_CELO_RPC_URL ?? "https://forno.celo.org"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_CELO_RPC_URL ?? "https://forno.celo.org"],
    },
  },
});

export const alfajores = defineChain({
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
      http: [process.env.NEXT_PUBLIC_ALFAJORES_RPC_URL ?? "https://alfajores-forno.celo-testnet.org"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_ALFAJORES_RPC_URL ?? "https://alfajores-forno.celo-testnet.org"],
    },
  },
});
