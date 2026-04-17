# AjoChain Contracts

Solidity smart contracts for AjoChain — on-chain rotating savings groups on Celo.

## Deployed Contracts

| Contract | Celo Mainnet | Alfajores Testnet |
|----------|-------------|-------------------|
| AjoCredential | [`0x70A8C3AbF529B26dB520a12ea63276cceb50bB30`](https://celoscan.io/address/0x70A8C3AbF529B26dB520a12ea63276cceb50bB30#code) | Set at deploy |
| AjoGroupFactory | [`0xAb672F162220ebB17B82bBcf8823Cd0f141515b9`](https://celoscan.io/address/0xAb672F162220ebB17B82bBcf8823Cd0f141515b9#code) | Set at deploy |

## Contract Overview

### AjoGroupFactory

Entry point for the protocol. Creates new savings groups and manages the group registry.

- Deploys a new `AjoSavingsGroup` per `createGroup()` call.
- Validates invite codes for `joinGroup()`.
- Stores group metadata for frontend discovery.
- Owns the `AjoCredential` contract and authorizes groups to mint.

### AjoSavingsGroup

One instance per savings circle. Handles the full lifecycle of a group.

- **Forming** — Creator adds members via the factory. Members can exit freely.
- **Active** — Members contribute cUSD each round. When all contribute, the round recipient receives the pot. Rounds repeat until every member has been paid out.
- **Paused** — Members can vote to pause (60% threshold) and vote to resume.
- **Completed** — All rounds finished. Soulbound credentials minted for every member.

Key constraints:
- Contribution amount: 1 wei to 50 cUSD per round.
- Group size: 3 to 15 members.
- Frequencies: daily (1), weekly (7), monthly (30).
- Reentrancy-guarded on all state-changing external functions.

### AjoCredential

ERC-721 soulbound token (non-transferable). Minted when a group completes its full cycle.

- On-chain SVG generation — no IPFS dependency.
- Stores recipient, group address, total saved, and completion timestamp.
- `tokenURI` returns base64-encoded JSON with embedded SVG image.

## Project Structure

```
contracts/
├── contracts/
│   ├── AjoGroupFactory.sol      # Factory and group registry
│   ├── AjoSavingsGroup.sol      # Per-group savings logic
│   ├── AjoCredential.sol        # Soulbound completion NFT
│   ├── interfaces/
│   │   ├── IAjoFactory.sol      # Factory interface
│   │   └── IAjoGroup.sol        # Group interface
│   ├── libraries/
│   │   └── Counters.sol         # Token ID counter
│   └── mocks/
│       ├── MockCUSD.sol          # Test ERC-20 token
│       └── MockReentrantCredential.sol  # Reentrancy test helper
├── scripts/
│   ├── deploy.ts                # Mainnet deployment
│   ├── deploy-testnet.ts        # Alfajores deployment
│   ├── verify.ts                # Celoscan verification
│   ├── smoke-test.ts            # Post-deploy sanity check
│   └── alfajores.ts             # Shared deploy utilities
├── test/
│   ├── AjoSavingsGroup.test.ts  # Core unit tests
│   ├── AjoGroupFactory.test.ts  # Factory unit tests
│   ├── AjoCredential.test.ts    # Credential unit tests
│   └── integration/             # Full-cycle and security tests
├── hardhat.config.ts
└── .env.example
```

## Setup

```bash
# From the repo root
cd contracts
pnpm install

# Copy env template and fill in your values
cp .env.example .env
```

Required values in `.env`:

| Variable | Purpose |
|----------|---------|
| `PRIVATE_KEY` | Deployer wallet key (0x-prefixed, 32 bytes) |
| `CELOSCAN_API_KEY` | For contract verification on Celoscan |

## Build and Test

```bash
# Compile
npx hardhat compile

# Run all tests (67 tests)
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Lint Solidity
npx solhint "contracts/**/*.sol"
```

## Deploy

### Alfajores (testnet)

```bash
npx hardhat run scripts/deploy-testnet.ts --network alfajores
npx hardhat run scripts/smoke-test.ts --network alfajores
```

### Celo (mainnet)

```bash
npx hardhat run scripts/deploy.ts --network celo
```

The deploy script will:
1. Deploy `AjoCredential`.
2. Deploy `AjoGroupFactory` with cUSD and credential addresses.
3. Transfer credential ownership to the factory.
4. Update frontend address file.
5. Verify both contracts on Celoscan.

## Verify

If verification did not run during deployment:

```bash
npx hardhat verify --network celo <CredentialAddress>
npx hardhat verify --network celo <FactoryAddress> <cUSD> <CredentialAddress>
```

## Gas Benchmarks

Measured on Hardhat local network with optimizer enabled (200 runs, viaIR):

| Operation | Gas |
|-----------|-----|
| `createGroup` | ~2,056,000 |
| `joinGroup` | ~139,000 |
| `contribute` | ~111,000 |
| Full round payout | ~287,000 |

At Celo's typical base fee (~25 gwei), a full group lifecycle for 5 members costs roughly 0.08 CELO in total gas.

## Dependencies

- [OpenZeppelin Contracts v4.9.6](https://docs.openzeppelin.com/contracts/4.x/) — ERC-721, Ownable, ReentrancyGuard, Strings, Base64
- [Hardhat v2.28](https://hardhat.org/) — Compilation, testing, deployment
- [@nomicfoundation/hardhat-verify](https://www.npmjs.com/package/@nomicfoundation/hardhat-verify) — Celoscan source verification

## License

MIT
