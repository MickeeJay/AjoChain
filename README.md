# AjoChain

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)
[![Celo Network](https://img.shields.io/badge/network-Celo-00A790)](https://docs.celo.org/)

AjoChain is a MiniPay Mini App on Celo that turns African rotating savings groups into transparent, automated, on-chain savings circles.

AjoChain replaces the human organizer with smart contracts so contributions, payout order, and group rules are enforced automatically without a single person holding the money.

## Problem

Across West and East Africa, rotating savings groups are a trusted financial tool. They are known as Ajo, Susu, Chama, Tontine, or similar local names. Market traders, gig workers, artisans, and diaspora families use them to build discipline, pool liquidity, and protect each other from cash-flow shocks.

The weakness is not the idea. It is the coordination model. One organizer often collects the money, records contributions, tracks payouts, and resolves disputes. That creates friction, manual errors, social pressure, and a single point of failure that can break trust in the group.

## Solution

AjoChain moves the savings circle onto Celo. A smart contract replaces the human organizer and becomes the neutral rule enforcer for the group. It tracks members, contribution schedules, missed payments, payout order, and completion rules in a way that no single person can alter on a whim.

The Mini App experience inside MiniPay keeps the user flow simple. Members can join with wallet-based identity, contribute with cUSD, and follow the group cycle without learning complex blockchain concepts. The result is a savings product that feels familiar locally, but gains the transparency and automation of software.

## One-Line Pitch

AjoChain brings Africa's rotating savings tradition on-chain so Ajo, Susu, and Chama groups can save together transparently in MiniPay with cUSD.

## Architecture

```text
User
  |
  v
MiniPay Wallet
  |
  v
AjoChain Mini App
  |
  v
Celo Smart Contract
```

## Features

### Week 1 MVP

- Create a savings group with fixed contribution amount and cycle length.
- Join a group with wallet-based identity.
- Contribute cUSD on schedule.
- Track member status and payment history.
- Trigger group payout when rules are satisfied.
- Basic MiniPay-compatible frontend built with Next.js App Router.

### Week 2 Full Version

- Flexible group sizes and payout schedules.
- Auto-detection of missed contributions and late-payment penalties.
- Completion credential for successful members.
- Optional premium tier for advanced analytics and admin tools.
- Group insurance hook for contribution protection.
- Better onboarding, notifications, and mobile-first UX polish.

## Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Blockchain | Celo | Ethereum L2 on OP Stack |
| Smart Contracts | Solidity ^0.8.20 | Group logic and rule enforcement |
| Contract Tooling | Hardhat | Deploy, test, and verify contracts |
| Frontend | Next.js 14 | App Router, TypeScript |
| Wallet | viem + wagmi v2 | MiniPay-compatible wallet stack |
| Payments | cUSD via Mento | Stablecoin contribution rail |
| Styling | Tailwind CSS | Responsive UI styling |
| Deployment | Vercel + Celo mainnet | Frontend and production contracts |
| Testing | Hardhat + chai + mocha | Unit and integration tests |

## Smart Contract Architecture

AjoChain uses two core contracts:

- GroupFactory: creates new savings groups, stores lightweight registry data, and deploys or references group instances.
- SavingsGroup: handles membership, contribution enforcement, payout execution, status tracking, and completion logic for one circle.

Suggested responsibilities:

- GroupFactory
  - Create new group instances.
  - Store group metadata and discovery fields.
  - Emit events for off-chain indexing.
  - Keep the registry minimal and cheap to query.

- SavingsGroup
  - Enforce contribution amount and cadence.
  - Track member joins, exits, and payment state.
  - Validate payout readiness.
  - Release pooled funds according to the schedule.
  - Record final completion state.

## On-Chain vs Off-Chain

| On-Chain | Off-Chain |
| --- | --- |
| Group creation and membership | UI rendering and navigation |
| Contribution rules and validation | Marketing pages and content |
| Payment history and state transitions | Analytics dashboards |
| Payout execution | Event indexing and search |
| Completion status | Notifications and email reminders |
| Contract events | Cached metadata and avatars |

## Transaction Flow

```text
1. User opens AjoChain in MiniPay
2. User connects wallet and chooses or creates a group
3. User approves cUSD contribution
4. Mini App submits transaction to Celo
5. SavingsGroup records contribution on-chain
6. When the cycle condition is met, contract releases payout
7. Group completion is recorded and displayed back in the app
```

## Local Development

### Prerequisites

- Node.js 20 or newer
- npm, pnpm, or yarn
- Git
- A Celo-compatible wallet for testing
- MiniPay developer mode access for in-app testing

### Install

```bash
npm install
```

### Environment Setup

Create a `.env.local` file for the frontend and a `.env` file for Hardhat if needed.

### Run the Frontend

```bash
npm run dev
```

### Run Smart Contract Tests

```bash
npx hardhat test
```

### Compile Contracts

```bash
npx hardhat compile
```

## Testnet Deployment

Use Alfajores for test deployments before going to mainnet.

1. Configure the Hardhat network for Alfajores.
2. Fund your deployer wallet from the faucet.
3. Deploy the contracts with Hardhat.
4. Update the frontend contract addresses in your environment variables.
5. Test the app inside MiniPay using the testnet RPC and deployed addresses.

Faucet: https://faucet.celo.org/alfajores

## Mainnet Deployment

1. Audit and test the contracts thoroughly on Alfajores.
2. Verify contract addresses and deployment parameters.
3. Set the production RPC and deployer credentials.
4. Deploy GroupFactory first, then deploy or register SavingsGroup instances.
5. Update the frontend with mainnet contract addresses.
6. Deploy the frontend to Vercel.
7. Confirm end-to-end MiniPay flows on Celo mainnet.

For network guidance and current Celo documentation, see https://docs.celo.org/

## Testing in MiniPay

1. Enable developer mode in MiniPay.
2. Expose your local app with an ngrok tunnel.
3. Open the tunnel URL inside MiniPay.
4. Confirm wallet connection and cUSD contribution flow.
5. Test both group creation and member join paths.

Example:

```bash
ngrok http 3000
```

## Environment Variables

| Variable | Example | Purpose |
| --- | --- | --- |
| NEXT_PUBLIC_APP_NAME | AjoChain | Public app name |
| NEXT_PUBLIC_CHAIN_ID | 44787 | Alfajores chain ID example |
| NEXT_PUBLIC_RPC_URL | https://alfajores-forno.celo-testnet.org | Public RPC endpoint |
| NEXT_PUBLIC_CONTRACT_FACTORY_ADDRESS | 0x1111111111111111111111111111111111111111 | Factory contract address |
| NEXT_PUBLIC_SAVINGS_GROUP_ADDRESS | 0x2222222222222222222222222222222222222222 | Group contract address |
| PRIVATE_KEY | 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa | Deployer key for Hardhat only |
| NEXT_PUBLIC_MENTO_TOKEN_ADDRESS | 0x3333333333333333333333333333333333333333 | cUSD token address |
| NEXT_PUBLIC_MINIPAY_DEEP_LINK | minipay:// | MiniPay deep link or fallback |

Do not commit real secrets. Use placeholder values in shared examples.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes with tests where possible.
4. Run contract tests and frontend checks locally.
5. Open a pull request with a clear description of the change.

Please keep contributions aligned with the MiniPay-compatible stack: viem, wagmi v2, Solidity, Hardhat, and Next.js 14.

## License

MIT

## Resources
- See the Celo documentation at https://docs.celo.org/ 
