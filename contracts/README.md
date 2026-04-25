# AjoChain Contracts

This package contains the Solidity protocol for AjoChain savings groups and the Hardhat workspace used for build, test, deployment, and verification.

## Mainnet Deployments

| Contract | Address | Explorer |
|---|---|---|
| AjoGroupFactory | `0xAb672F162220ebB17B82bBcf8823Cd0f141515b9` | https://celoscan.io/address/0xAb672F162220ebB17B82bBcf8823Cd0f141515b9#code |
| AjoCredential | `0x70A8C3AbF529B26dB520a12ea63276cceb50bB30` | https://celoscan.io/address/0x70A8C3AbF529B26dB520a12ea63276cceb50bB30#code |

## Contract Boundaries

### AjoGroupFactory

Responsibilities:

- Validates group creation constraints.
- Deploys one `AjoSavingsGroup` instance per group.
- Stores group addresses by `groupId`.
- Stores hashed invite code per group.
- Registers each deployed group as an authorized minter in `AjoCredential`.

Creation constraints enforced by the factory:

- Group size: 3 to 20 members.
- Contribution amount: `0 < amount <= 50e18`.
- Frequency in days: only `1`, `7`, or `30`.
- Pot limit: `contributionAmount * maxMembers <= 500e18`.

### AjoSavingsGroup

One deployed instance per savings group.

Lifecycle states:

- `FORMING`: members are added through the factory.
- `ACTIVE`: members contribute each round and payouts execute.
- `PAUSED`: contribution/payout flow is paused until resumed.
- `COMPLETED`: all rounds finished and credentials minted.

Core behavior:

- Creator starts the group after minimum membership is reached.
- Member order is shuffled at start and used for payout sequence.
- Each active member contributes once per round.
- Round can auto-payout when all members have contributed.
- Members vote pause/resume and creator applies pause transitions once vote threshold is met.
- `emergencyExit` is allowed only while forming.

### AjoCredential

Soulbound completion credential:

- ERC-721 with transfer blocked post-mint.
- Only authorized group contracts can mint.
- Stores credential records on-chain.
- `tokenURI` returns base64 JSON with embedded SVG image.

## Workspace Structure

```text
contracts/
├── contracts/
│   ├── AjoGroupFactory.sol
│   ├── AjoSavingsGroup.sol
│   ├── AjoCredential.sol
│   ├── interfaces/
│   ├── libraries/
│   └── mocks/
├── scripts/
├── test/
├── hardhat.config.ts
└── .env.example
```

## Local Setup

```bash
cd contracts
pnpm install
cp .env.example .env
```

Required variables in `.env`:

- `PRIVATE_KEY`
- `CELOSCAN_API_KEY`

Optional:

- `REPORT_GAS=true` to enable gas reporter.

## Build and Test

```bash
pnpm run compile
pnpm run test
pnpm run lint
```

With gas reporter:

```bash
REPORT_GAS=true pnpm run test
```

## Deployment and Verification

Alfajores:

```bash
pnpm run deploy:testnet
pnpm run smoke:testnet
pnpm run verify:testnet
```

Celo mainnet:

```bash
pnpm run deploy
pnpm run verify
```

Manual verify fallback:

```bash
npx hardhat verify --network celo <CredentialAddress>
npx hardhat verify --network celo <FactoryAddress> <cUSDAddress> <CredentialAddress>
```

## Test Coverage Focus

The suite covers:

- Group creation and invite joins.
- Membership boundaries and invalid parameter handling.
- Round contribution and payout flow.
- Pause/resume governance.
- Forming-only exits.
- Reentrancy protections.
- Unauthorized access attempts.
- Invite-code validation checks.
- Gas benchmark assertions.

## Security Notes for Contract Operators

- Keep deployer keys and verification keys out of version control.
- Run `bash ../scripts/check-secrets.sh` before pushing deployment changes.
- Verify deployed bytecode and constructor arguments on Celoscan.
- Treat any leaked deployer key as compromised and rotate immediately.

## License

MIT
