# AjoChain

AjoChain is a Celo-based rotating savings protocol and MiniPay-ready web app. It formalizes community savings circles into auditable smart contract flows: group creation, invite-based membership, scheduled contributions in cUSD, deterministic round payouts, and non-transferable completion credentials.

## Mainnet Status

| Component | Address | Explorer |
|---|---|---|
| AjoGroupFactory | `0xAb672F162220ebB17B82bBcf8823Cd0f141515b9` | https://celoscan.io/address/0xAb672F162220ebB17B82bBcf8823Cd0f141515b9#code |
| AjoCredential | `0x70A8C3AbF529B26dB520a12ea63276cceb50bB30` | https://celoscan.io/address/0x70A8C3AbF529B26dB520a12ea63276cceb50bB30#code |
| cUSD (Mento) | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | https://celoscan.io/address/0x765DE816845861e75A25fCA122bb6898B8B1282a |

## Repository Layout

```text
AjoChain/
├── contracts/              # Hardhat workspace (Solidity, tests, deployment)
├── packages/react-app/     # Next.js frontend
├── docs/                   # Ops and deployment guides
├── scripts/                # Utility scripts (including secret scan)
└── README.md
```

## System Overview

### On-chain components

1. `AjoGroupFactory`
- Protocol entry point.
- Validates group parameters.
- Deploys one `AjoSavingsGroup` per group.
- Stores group registry and invite hashes.
- Authorizes each new group on `AjoCredential`.

2. `AjoSavingsGroup`
- Handles group lifecycle (`FORMING`, `ACTIVE`, `PAUSED`, `COMPLETED`).
- Enforces contribution timing and one-contribution-per-round semantics.
- Executes payouts round by round.
- Supports vote-based pause/resume with a 60% threshold.
- Mints completion credentials for members once final round settles.

3. `AjoCredential`
- ERC-721 token with transfer blocked after mint (soulbound behavior).
- Mints only from authorized group contracts.
- Stores completion records and serves on-chain SVG/JSON token metadata.

### Off-chain components

Frontend and API routes live in `packages/react-app`:

- `GET /api/invite?code=0x...`
  - Returns invite metadata.
  - Cached for 60 seconds.
- `GET /api/groups/[address]`
  - Returns cached group state.
  - Cached for 30 seconds.
- `POST /api/share`
  - Generates share payload from `{ groupAddress, inviteCode }`.
  - Rate limited to 10 requests/IP/minute.

These API routes are read-only and do not sign transactions.

## Contract Rules and Limits

The factory enforces the following limits:

- Group size: 3 to 20 members.
- Contribution per round: greater than 0 and less than or equal to 50 cUSD.
- Maximum pot (`contributionAmount * maxMembers`): less than or equal to 500 cUSD.
- Allowed frequencies: 1 day, 7 days, or 30 days.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Install

```bash
git clone https://github.com/MickeeJay/AjoChain.git
cd AjoChain
pnpm install
```

### Configure environment files

```bash
cp .env.example .env.local
cp contracts/.env.example contracts/.env
```

Do not commit generated env files.

### Run frontend

```bash
pnpm --filter @ajochain/react-app dev
```

### Compile and test contracts

```bash
pnpm --filter @ajochain/contracts compile
pnpm --filter @ajochain/contracts test
```

### Run secret scan before push

```bash
bash scripts/check-secrets.sh
```

## Deployment

### Frontend (Vercel)

The repository contains root-level `vercel.json` for monorepo deployment with:

- `framework: nextjs`
- `installCommand: npm install`
- `buildCommand: cd packages/react-app && npm run build`
- `outputDirectory: packages/react-app/.next`

Detailed operational steps: `docs/vercel-github-manual-deploy.md`.

### Contracts (Alfajores)

```bash
pnpm --filter @ajochain/contracts deploy:testnet
pnpm --filter @ajochain/contracts smoke:testnet
```

### Contracts (Celo mainnet)

```bash
pnpm --filter @ajochain/contracts deploy
pnpm --filter @ajochain/contracts verify
```

## Environment Variables

### Frontend (`.env.local`)

Required/commonly used values:

- `NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_CUSD_ADDRESS`
- `NEXT_PUBLIC_CELO_CHAIN_ID`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_APP_URL`

Optional Alfajores values:

- `NEXT_PUBLIC_FACTORY_ALFAJORES_CONTRACT_ADDRESS` (or `NEXT_PUBLIC_FACTORY_TESTNET_CONTRACT_ADDRESS`)
- `NEXT_PUBLIC_CREDENTIAL_ALFAJORES_CONTRACT_ADDRESS` (or `NEXT_PUBLIC_CREDENTIAL_TESTNET_CONTRACT_ADDRESS`)
- `NEXT_PUBLIC_CUSD_ALFAJORES`
- `NEXT_PUBLIC_ALFAJORES_CHAIN_ID`

### Contracts (`contracts/.env`)

- `PRIVATE_KEY`
- `CELOSCAN_API_KEY`
- `REPORT_GAS` (optional)

## Testing and Quality

Contract tests include unit coverage for all three contracts plus integration/security-oriented scenarios for:

- Full round lifecycle.
- Reentrancy resistance.
- Unauthorized access attempts.
- Invite-code validation behavior.
- Gas benchmark assertions.

Recommended local checks before opening a PR:

```bash
pnpm --filter @ajochain/contracts test
pnpm --filter @ajochain/react-app typecheck
pnpm --filter @ajochain/react-app lint
bash scripts/check-secrets.sh
```

## Security

Security policy and disclosure process are documented in `SECURITY.md`.

Operational baseline:

- Never commit private keys, mnemonics, keystore files, or populated env files.
- Rotate compromised credentials immediately.
- Treat testnet and mainnet credentials as sensitive.

## Network Reference

| Network | Chain ID | RPC | Explorer | cUSD |
|---|---|---|---|---|
| Celo Mainnet | `42220` | `https://forno.celo.org` | https://celoscan.io | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| Alfajores | `44787` | `https://alfajores-forno.celo-testnet.org` | https://alfajores.celoscan.io | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` |

## Additional Documentation

- `contracts/README.md` for contract-focused development and operations.
- `docs/vercel-github-manual-deploy.md` for frontend production deployment.
- `project-description.md` for product-level positioning and context.

## License

MIT
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/4.x/)
- [Hardhat Documentation](https://hardhat.org/docs)
