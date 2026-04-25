# AjoChain Frontend Deployment (GitHub -> Vercel)

This runbook covers production deployment of the Next.js frontend in this monorepo.

## 1. Create the Vercel Project

1. Import the repository into Vercel.
2. Keep the repository root as project root.
3. Confirm Vercel reads root `vercel.json`.

Configured build settings:

- `framework`: `nextjs`
- `installCommand`: `npm install`
- `buildCommand`: `cd packages/react-app && npm run build`
- `outputDirectory`: `packages/react-app/.next`

## 2. Configure Production Environment Variables

Set these in Vercel Project Settings for Production:

- `NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org`
- `NEXT_PUBLIC_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org`
- `NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=0xAb672F162220ebB17B82bBcf8823Cd0f141515b9`
- `NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS=0x70A8C3AbF529B26dB520a12ea63276cceb50bB30`
- `NEXT_PUBLIC_CUSD_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a`
- `NEXT_PUBLIC_CELO_CHAIN_ID=42220`
- `NEXT_PUBLIC_APP_URL=https://ajochain.vercel.app`

Optional testnet values:

- `NEXT_PUBLIC_ALFAJORES_CHAIN_ID=44787`
- `NEXT_PUBLIC_CUSD_ALFAJORES=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

Notes:

- `NEXT_PUBLIC_*` values are public runtime config.
- Do not place private keys or backend credentials in frontend env vars.

## 3. Deploy

1. Push to the connected branch.
2. Wait for Vercel build to complete.
3. Confirm deployment status is `Ready`.

## 4. Validate Runtime Security Headers

Expected headers from `vercel.json` include:

- `X-Frame-Options: SAMEORIGIN`
- CSP with `frame-ancestors` including `https://minipay.xyz` and `https://*.minipay.xyz`

If MiniPay embedding is blocked by browser policy handling, retain CSP `frame-ancestors` and evaluate removal of `X-Frame-Options` in a controlled follow-up release.

## 5. Post-Deployment Verification Checklist

1. Home page loads without client runtime errors.
2. Create flow loads and completes expected transaction prompts.
3. Invite route renders metadata from API without wallet connection.
4. Share flow returns valid payload from `POST /api/share`.
5. Open Graph preview resolves on invite links.

## 6. Operational Rollback Plan

If a production regression is detected:

1. Promote previous known-good Vercel deployment.
2. Re-validate homepage, create flow, invite flow, and share payload endpoints.
3. Open incident issue with root cause, impacted surface, and preventive action.

## 7. Custom Domain (Optional)

1. Add domain in Vercel settings.
2. Configure DNS as instructed by Vercel.
3. Update `NEXT_PUBLIC_APP_URL` to domain URL.
4. Redeploy and verify canonical links and OG metadata.
