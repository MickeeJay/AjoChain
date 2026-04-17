# Security Policy

## Responsible Disclosure

Report security issues privately through a GitHub Security Advisory for this repository.
If email is preferred, contact `security@ajochain.dev`.

Do not open public issues or pull requests for vulnerabilities until a fix has been coordinated.

## Audit Status

An internal pre-deployment audit was completed in April 2026, covering all three contracts. The audit identified and fixed 13 issues across logic, gas efficiency, interface correctness, and configuration. All 67 tests pass after the fixes.

AjoChain has not been reviewed by a third-party audit firm. Use it at your own risk until an independent review is completed.

## Contract Safety Limits

The contracts enforce conservative limits for initial deployment:

| Parameter | Limit |
|-----------|-------|
| Max contribution per round | 50 cUSD |
| Max pot value (contribution × members) | 750 cUSD |
| Group size | 3 to 15 members |
| Frequencies | Daily, weekly, monthly |

These limits are compiled as constants. Changing them requires a new contract deployment.

## Known Accepted Risks

- **Shuffle randomness**: Payout order is shuffled using `blockhash` and `block.timestamp`. Celo validators can influence the timestamp within a ~5 second window. For a social savings group with small pot sizes, the economic incentive to manipulate order is negligible. This is not suitable for high-stakes lotteries.

- **No active-phase exit**: Once a group moves from FORMING to ACTIVE, members cannot leave. This is by design — the savings circle depends on all members completing every round. Members accept this by joining.

- **Emergency exit only during FORMING**: Members can exit freely while the group is still forming. No cUSD has been deposited at that stage, so no refund logic is needed.

## Secrets and Private Keys

Never share private keys, seed phrases, mnemonic files, or keystore contents in issues, pull requests, logs, screenshots, or chat messages.

The following files are gitignored and must never be committed:

- `.env` (all directories)
- `*.key`, `*.pem`
- `mnemonic.txt`
- `keystore/`

If a secret is exposed:

1. Rotate or revoke the compromised key immediately.
2. Notify the maintainer privately.
3. Provide only the minimum reproduction details needed to investigate.

## What To Include In A Report

When reporting a vulnerability, include:

- Network used (mainnet or Alfajores)
- Contract address
- Transaction hash if available
- Steps to reproduce
- Expected vs actual behavior
- Any relevant screenshots or logs with secrets removed

## Deployed Contracts

| Contract | Celo Mainnet |
|----------|-------------|
| AjoCredential | `0x70A8C3AbF529B26dB520a12ea63276cceb50bB30` |
| AjoGroupFactory | `0xAb672F162220ebB17B82bBcf8823Cd0f141515b9` |
