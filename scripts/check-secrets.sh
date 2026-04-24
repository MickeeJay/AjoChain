#!/usr/bin/env bash
set -euo pipefail

if ! command -v rg >/dev/null 2>&1; then
  echo "Error: ripgrep (rg) is required for secret checks." >&2
  exit 2
fi

patterns='(PRIVATE_KEY|MNEMONIC|SEED_PHRASE|WALLET_SECRET|CELOSCAN_API_KEY|ALCHEMY_API_KEY|INFURA_API_KEY|AWS_SECRET_ACCESS_KEY|BEGIN[[:space:]]+PRIVATE[[:space:]]+KEY|xprv|0x[a-fA-F0-9]{64})'

tracked_files=$(git ls-files)
if [[ -z "${tracked_files}" ]]; then
  echo "No tracked files found."
  exit 0
fi

# Scan tracked files only, while excluding known lockfiles and binary-heavy folders.
if echo "${tracked_files}" | rg -v '(^|/)(node_modules|artifacts|cache|.next|dist|build)/|\.lock$' | xargs rg -n --no-heading -S -e "${patterns}"; then
  echo ""
  echo "Potential secret-like content found in tracked files. Review before push." >&2
  exit 1
fi

echo "Secret scan passed: no obvious secrets detected in tracked files."
