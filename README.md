# AjoChain

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-67%20passing-brightgreen)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)
[![Celo Network](https://img.shields.io/badge/network-Celo-00A790)](https://docs.celo.org/)
[![Deployed](https://img.shields.io/badge/mainnet-live-success)](https://celoscan.io/address/0xAb672F162220ebB17B82bBcf8823Cd0f141515b9)

AjoChain is a MiniPay Mini App on Celo that brings African rotating savings groups on-chain. Smart contracts enforce contribution rules, payout order, and group governance — replacing the human organizer with transparent, verifiable logic.

## Problem

Across West and East Africa, rotating savings groups are a trusted financial tool. They are known as Ajo, Susu, Chama, Tontine, or similar local names. Market traders, gig workers, artisans, and diaspora families use them to build discipline, pool liquidity, and protect each other from cash-flow shocks.

The weakness is not the idea. It is the coordination model. One organizer collects the money, records contributions, tracks payouts, and resolves disputes. That creates friction, manual errors, social pressure, and a single point of failure that can break trust in the group.

## Solution

AjoChain moves the savings circle onto Celo. A smart contract replaces the human organizer and becomes the neutral rule enforcer for the group. It tracks members, contribution schedules, missed payments, payout rotation, pause control, and completion rules in a way that no single person can alter.

The Mini App experience inside MiniPay keeps the user flow simple. Members can join with wallet-based identity, contribute with cUSD, and follow the group rounds without learning complex blockchain concepts. The result is a savings product that feels familiar locally, but gains the transparency and consistency of on-chain execution.

## Mainnet Deployment

AjoChain is live on Celo mainnet. Both contracts are verified on Celoscan.

| Contract | Address | Explorer |
|----------|---------|----------|
| AjoCredential | `0x70A8C3AbF529B26dB520a12ea63276cceb50bB30` | [View on Celoscan](https://celoscan.io/address/0x70A8C3AbF529B26dB520a12ea63276cceb50bB30#code) |
| AjoGroupFactory | `0xAb672F162220ebB17B82bBcf8823Cd0f141515b9` | [View on Celoscan](https://celoscan.io/address/0xAb672F162220ebB17B82bBcf8823Cd0f141515b9#code) |
| cUSD (Mento) | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | [View on Celoscan](https://celoscan.io/address/0x765DE816845861e75A25fCA122bb6898B8B1282a) |

## Architecture

```text
User
  │
  ▼
MiniPay Wallet
  │
  ▼
AjoChain Mini App (Next.js)
  │
  ▼
┌──────────────────────────────────┐
│         Celo Mainnet             │
│                                  │
│  AjoGroupFactory                 │
│    ├── createGroup()             │
│    ├── joinGroup()               │
│    └── manages group registry    │
│                                  │
│  AjoSavingsGroup (per group)     │
│    ├── contribute()              │
│    ├── executePayout()           │
│    ├── pause / resume voting     │
│    └── completion + credentials  │
│                                  │
│  AjoCredential (soulbound NFT)   │
│    └── mints on group completion │
└──────────────────────────────────┘
```

## Smart Contracts

AjoChain uses three contracts that work together:

**AjoGroupFactory** — The entry point. Creates new savings groups, stores the group registry, manages invite-code-based joins, and owns the credential contract. Each `createGroup` call deploys a new `AjoSavingsGroup` instance.

**AjoSavingsGroup** — One contract per savings circle. Handles membership, round-based contribution enforcement, deadline tracking, payout execution, pause/resume voting (60% threshold), emergency exit during formation, and on-chain completion state. When the final round completes, it mints soulbound credentials for every member.

**AjoCredential** — An ERC-721 soulbound token (non-transferable). Stores on-chain metadata including group name, total saved, and completion timestamp. Generates a base64-encoded SVG and JSON `tokenURI` fully on-chain — no IPFS dependency.

### On-Chain vs Off-Chain

| On-Chain | Off-Chain |
|----------|-----------|
| Group creation and membership | UI rendering and navigation |
| Contribution rules and validation | Marketing pages and content |
| Payment history and state transitions | Analytics and dashboards |
| Payout execution and round tracking | Event indexing and search |
| Completion status and credentials | Notifications and reminders |

## Features

- Create a savings group with fixed contribution amount and round frequency (daily, weekly, monthly).
- Join groups using invite codes.
- Contribute cUSD on schedule with deadline enforcement.
- Fair payout order via on-chain roster shuffle at group start.
- Track member status and contribution history.
- Trigger group payout when all members have contributed for the round.
- Pause or resume a group via member voting (60% threshold).
- Exit safely while the group is still forming.
- Earn a soulbound completion credential NFT with on-chain metadata.

## Off-Chain Coordination APIs

The Mini App now exposes minimal read-only API routes for invite and social coordination. These routes never use `PRIVATE_KEY` and never submit transactions.

| Route | Method | Purpose | Cache / Limit |
|-------|--------|---------|---------------|
| `/api/invite?code=0x...` | GET | Resolves invite code to group metadata (`name`, `amount`, `frequency`, `memberCount`, `maxMembers`) | 60s cache |
| `/api/groups/[address]` | GET | Returns wallet-free cached group state for invite landing and share pages | 30s cache |
| `/api/share` | POST | Builds WhatsApp message + deep link and Twitter/X card metadata from `{ groupAddress, inviteCode }` | 10 req/IP/min |

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Blockchain | Celo | EVM-compatible L2 on OP Stack |
| Smart Contracts | Solidity 0.8.24 | OpenZeppelin v4, ReentrancyGuard, ERC-721 |
| Contract Tooling | Hardhat 2.28 | Compile, test, deploy, verify |
| Frontend | Next.js 14 | App Router, TypeScript |
| Wallet | viem + wagmi v2 | MiniPay-compatible wallet stack |
| Payments | cUSD (Mento) | Stablecoin contribution rail |
| Styling | Tailwind CSS | Responsive, mobile-first UI |
| Hosting | Vercel | Frontend deployment |
| Testing | Hardhat + Chai + Mocha | 67 tests (unit, integration, security) |

## Local Development

### Prerequisites

- Node.js 18+ (20 recommended)
- pnpm 8+
- Git

### Install

```bash
git clone https://github.com/MickeeJay/AjoChain.git
cd AjoChain
pnpm install
```

### Environment Setup

Copy the example files and fill in your values:

```bash
# Root-level env for the frontend
cp .env.example .env.local

# Contract-level env for Hardhat
cp contracts/.env.example contracts/.env
```

See the [Environment Variables](#environment-variables) section for details on each key.

### Compile Contracts

```bash
cd contracts
npx hardhat compile
```

### Run Tests

```bash
cd contracts
npx hardhat test
```

Expected output: `67 passing`.

### Run the Frontend

```bash
pnpm run dev
```

## Testnet Deployment (Alfajores)

1. Get testnet CELO and cUSD from the [Alfajores Faucet](https://faucet.celo.org/alfajores).
2. Set `PRIVATE_KEY` in `contracts/.env`.
3. Deploy:

```bash
cd contracts
npx hardhat run scripts/deploy-testnet.ts --network alfajores
```

4. Smoke test the deployment:

```bash
npx hardhat run scripts/smoke-test.ts --network alfajores
```

5. Verify on Celoscan:

```bash
npx hardhat verify --network alfajores <CredentialAddress>
npx hardhat verify --network alfajores <FactoryAddress> <cUSD_Alfajores> <CredentialAddress>
```

Alfajores cUSD: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

## Mainnet Deployment

> Contracts are already deployed and verified on Celo mainnet. These steps are for reference or redeployment.

1. Fund the deployer wallet with at least 0.5 CELO on mainnet.
2. Set `PRIVATE_KEY` and `CELOSCAN_API_KEY` in `contracts/.env`.
3. Deploy:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network celo
```

4. Verify:

```bash
npx hardhat verify --network celo <CredentialAddress>
npx hardhat verify --network celo <FactoryAddress> 0x765DE816845861e75A25fCA122bb6898B8B1282a <CredentialAddress>
```

5. Confirm ownership:

```bash
# Factory owner should be your deployer address
cast call <FactoryAddress> "owner()(address)" --rpc-url https://forno.celo.org

# Credential owner should be the factory address
cast call <CredentialAddress> "owner()(address)" --rpc-url https://forno.celo.org
```

6. Update frontend addresses in `packages/react-app/lib/contracts/addresses.ts`.

## Testing in MiniPay

1. Enable developer mode in MiniPay settings.
2. Expose your local app with a tunnel:

```bash
ngrok http 3000
```

3. Open the tunnel URL inside MiniPay.
4. Confirm wallet connection and cUSD contribution flows.
5. Test both group creation and member join paths.

## Environment Variables

### Frontend (`/.env.local`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS` | `0xAb672F1...` | Deployed factory address |
| `NEXT_PUBLIC_CUSD_ADDRESS` | `0x765DE8...` | cUSD on Celo mainnet |
| `NEXT_PUBLIC_CUSD_ALFAJORES` | `0x874069...` | cUSD on Alfajores |
| `NEXT_PUBLIC_CELO_CHAIN_ID` | `42220` | Mainnet chain ID |
| `NEXT_PUBLIC_ALFAJORES_CHAIN_ID` | `44787` | Testnet chain ID |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `abc123...` | WalletConnect project ID |

### Contracts (`/contracts/.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `PRIVATE_KEY` | `0xabc...` | Deployer wallet key (never commit) |
| `CELOSCAN_API_KEY` | `HE5KW...` | Celoscan verification API key |
| `REPORT_GAS` | `true` | Show gas usage in test output |

> **Warning:** Never commit `.env` files with real keys. Both are gitignored. Use `.env.example` files as templates.

## Transaction Flow

```text
1. User opens AjoChain in MiniPay
2. User connects wallet and creates or joins a group
3. User approves cUSD spending for the group contract
4. User submits a contribution transaction
5. SavingsGroup records the contribution on-chain
6. When all members contribute, the payout recipient receives the pot
7. Rounds repeat until every member has received a payout
8. On completion, each member receives a soulbound credential NFT
```

## Network Reference

| | Celo Mainnet | Alfajores Testnet |
|---|---|---|
| Chain ID | 42220 | 44787 |
| RPC | `https://forno.celo.org` | `https://alfajores-forno.celo-testnet.org` |
| Explorer | [celoscan.io](https://celoscan.io) | [alfajores.celoscan.io](https://alfajores.celoscan.io) |
| cUSD | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` |
| Faucet | — | [faucet.celo.org/alfajores](https://faucet.celo.org/alfajores) |

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes with tests where possible.
4. Run contract tests and frontend checks locally.
5. Open a pull request with a clear description of the change.

Keep contributions aligned with the MiniPay-compatible stack: viem, wagmi v2, Solidity, Hardhat, and Next.js 14.

## Security

See [SECURITY.md](SECURITY.md) for the disclosure policy and known limitations.

## License

MIT

## Resources

- [Celo Documentation](https://docs.celo.org/)
- [MiniPay Developer Docs](https://docs.celo.org/developer/build-on-minipay)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/4.x/)
- [Hardhat Documentation](https://hardhat.org/docs)
