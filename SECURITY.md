# Security Policy

## Reporting a Vulnerability

We take the security of AjoChain seriously. If you discover a vulnerability, please report it privately through GitHub Security Advisories for this repository.

If you are unable to use the advisory system, please contact our security team directly at `security@ajochain.dev`.

To protect our users, please do not open public issues or pull requests for unpatched vulnerabilities. We appreciate your responsible disclosure and will work to address all valid reports promptly.

## Scope

The following components are in scope:

- Solidity smart contracts under `contracts/contracts`.
- Contract deployment, verification, and migration scripts.
- Frontend API routes and state-reading logic.
- Repository secret handling controls (`.gitignore`, secret scanning scripts, and environment variable patterns).

Out of scope:

- Third-party infrastructure outages or network-level disruptions.
- Vulnerabilities in external dependencies without a project-specific exploit path.

## Security Model

### Contract-level assumptions

- cUSD token contract behaves as standard ERC-20.
- Group participants accept fixed parameters at creation time.
- Group creator is expected to manage lifecycle actions such as `startGroup` and pause transitions.

### Guardrails implemented on-chain

- Reentrancy protection on state-changing flows where relevant.
- Group size, contribution amount, frequency, and max-pot constraints validated by factory.
- Invite-code matching required for joins.
- One-contribution-per-member-per-round logic.
- Unauthorized credential mint prevention through explicit group authorization.

## Known Limitations

1. Payout shuffle entropy is blockchain-derived and not suitable for high-stakes randomness requirements.
2. Members cannot exit after group activation by design.
3. Emergency exit exists only during forming phase because no pooled funds are expected yet.

## Secret Handling Requirements

Never commit or disclose:

- Private keys.
- Mnemonic/seed phrases.
- Keystore files.
- Populated `.env` files.
- API keys tied to privileged operations.

Repository controls:

- `.gitignore` blocks common secret-bearing file patterns.
- `scripts/check-secrets.sh` scans tracked files for secret-like material.

Run before every push:

```bash
bash scripts/check-secrets.sh
```

## Incident Response

If credentials are exposed:

1. Revoke/rotate compromised keys immediately.
2. Pause affected deployment operations.
3. Re-deploy from clean credentials if signer trust is impacted.
4. Publish user-facing mitigation notes after immediate containment.

If a contract vulnerability is confirmed:

1. Reproduce with a deterministic test.
2. Assess exploitability and blast radius.
3. Prepare and review patch.
4. Coordinate fix disclosure with clear upgrade/migration guidance.

## Submission Guidelines for Reports

Include:

- Network (`celo` or `alfajores`).
- Contract address and function(s) involved.
- Transaction hash(es), if applicable.
- Reproduction steps.
- Expected vs actual behavior.
- Estimated impact.

## Current Mainnet Contracts

| Contract | Address |
|---|---|
| AjoGroupFactory | `0xAb672F162220ebB17B82bBcf8823Cd0f141515b9` |
| AjoCredential | `0x70A8C3AbF529B26dB520a12ea63276cceb50bB30` |
