# AjoChain Frontend Deployment via GitHub -> Vercel

This guide is for production deployment of the Next.js MiniPay mini app using GitHub integration.

## 1) Vercel project creation

1. Sign in to Vercel.
2. Click **Add New Project** and import the AjoChain GitHub repository.
3. In project settings, keep the root as repository root.
4. Vercel will read `vercel.json` from the repository root.

## 2) Confirm build settings

These values are already declared in `vercel.json`:

- framework: `nextjs`
- installCommand: `npm install`
- buildCommand: `cd packages/react-app && npm run build`
- outputDirectory: `packages/react-app/.next`

## 3) Configure production environment variables

Set the following variables in Vercel for **Production** (and Preview if needed):

- `NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org`
- `NEXT_PUBLIC_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org`
- `NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS=0xAb672F162220ebB17B82bBcf8823Cd0f141515b9`
- `NEXT_PUBLIC_CREDENTIAL_CONTRACT_ADDRESS=0x70A8C3AbF529B26dB520a12ea63276cceb50bB30`
- `NEXT_PUBLIC_CUSD_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a`
- `NEXT_PUBLIC_CELO_CHAIN_ID=42220`
- `NEXT_PUBLIC_APP_URL=https://ajochain.vercel.app`

Optional:

- `NEXT_PUBLIC_ALFAJORES_CHAIN_ID=44787`
- `NEXT_PUBLIC_CUSD_ALFAJORES=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

## 4) Deploy

1. Push commits to your selected branch (for example `main`).
2. Vercel auto-builds from GitHub webhook.
3. Wait for build status to become **Ready**.
4. Open the public deployment URL.

## 5) Validate headers for MiniPay iframe

The app sends:

- `X-Frame-Options: SAMEORIGIN`
- `Content-Security-Policy` with `frame-ancestors` for `minipay.xyz`

Important note: strict browser handling can favor CSP `frame-ancestors` over X-Frame-Options behavior in some embedded contexts. If MiniPay production app blocks framing, keep CSP and remove `X-Frame-Options` in a follow-up deploy.

## 6) Post-deployment test checklist

1. Home page loads with no runtime console error.
2. MiniPay Developer Mode opens production URL (no ngrok).
3. Wallet auto-connect works in MiniPay.
4. Create group flow completes end-to-end.
5. Invite page `/invite/<code>` renders group details without wallet connect.
6. OG preview image resolves for invite links and appears in WhatsApp link preview.

## 7) Optional custom domain

1. Add `ajochain.xyz` or `ajochain.app` in Vercel domain settings.
2. Configure DNS records as instructed by Vercel.
3. Update `NEXT_PUBLIC_APP_URL` to custom domain URL.
4. Trigger redeploy.

## 8) MiniPay submission readiness

Before submission, verify in MiniPay production app (not only Developer Mode):

1. App opens in iframe.
2. Wallet connection and transaction prompts work.
3. Group creation and invite join paths function on mainnet.
4. All links use production domain.
