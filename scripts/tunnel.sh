#!/usr/bin/env bash
set -euo pipefail

# 1. Install ngrok: https://ngrok.com
# 2. Run Next.js dev server
npm run dev &
# 3. Create static tunnel (use free static domain)
ngrok http 3000 --domain=your-static-domain.ngrok-free.app
# 4. Open MiniPay -> Settings -> About -> tap version 5x -> Developer Mode
# 5. In Developer Settings -> Load test page -> paste ngrok URL
