#!/usr/bin/env bash
set -euo pipefail

patterns='((PRIVATE_KEY|MNEMONIC|SEED_PHRASE|WALLET_SECRET|CELOSCAN_API_KEY|ALCHEMY_API_KEY|INFURA_API_KEY|AWS_SECRET_ACCESS_KEY|AWS_SECRET_KEY|GITHUB_TOKEN|API_KEY|SECRET_KEY|ACCESS_TOKEN)[[:space:]]*[:=][[:space:]]*["'"'"']?[^"'"'"'[:space:]]{8,}|BEGIN[[:space:]]+PRIVATE[[:space:]]+KEY|xprv[[:alnum:]]+|mnemonic[[:space:]]*[:=][[:space:]]*["'"'"']?([[:alpha:]]+[[:space:]]+){11,}[[:alpha:]]+|0x[a-fA-F0-9]{64})'

tracked_files=$(git ls-files)
if [[ -z "${tracked_files}" ]]; then
  echo "No tracked files found."
  exit 0
fi

# Scan tracked files only, while excluding generated artifacts, docs, and known
# low-signal files where false positives are common.
mapfile -t filtered_files < <(
  echo "${tracked_files}" | grep -E -v '(^|/)(node_modules|artifacts|cache|.next|dist|build|coverage|typechain-types)/|\.lock$|(^|/)\.env(\..*)?$|(^|/)\.env\.example$|\.md$|\.svg$|\.png$|\.jpg$|\.jpeg$|\.gif$|\.webp$|^scripts/check-secrets\.sh$'
)

if [[ ${#filtered_files[@]} -eq 0 ]]; then
  echo "No eligible tracked files to scan."
  exit 0
fi

if command -v rg >/dev/null 2>&1; then
  scanner_output=$(rg -n --no-heading -S -e "${patterns}" "${filtered_files[@]}" || true)
else
  scanner_output=$(grep -E -n -H -- "${patterns}" "${filtered_files[@]}" || true)
fi

# Drop common false positives where code safely references env keys and examples.
filtered_output=$(echo "${scanner_output}" | grep -E -v 'process\.env\.|throw new Error\("PRIVATE_KEY|throw new Error\("CELOSCAN_API_KEY|YOUR_|your_|example|EXAMPLE' || true)

if [[ -n "${filtered_output//[[:space:]]/}" ]]; then
  echo "${filtered_output}"
  echo ""
  echo "Potential secret-like content found in tracked files. Review before push." >&2
  exit 1
fi

echo "Secret scan passed: no obvious secrets detected in tracked files."
