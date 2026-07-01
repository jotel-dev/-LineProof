#!/usr/bin/env bash
# check_contract_storage.sh
# Reads a key from a deployed Soroban contract's persistent storage.
# Usage: ./scripts/check_contract_storage.sh <contract-id> <key-json>
# Example: ./scripts/check_contract_storage.sh CXXX... '"config"'

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <contract-id> <storage-key-json>"
  exit 1
fi

CONTRACT_ID="$1"
KEY="$2"
NETWORK="${STELLAR_NETWORK:-testnet}"

echo "Reading storage key '$KEY' from contract $CONTRACT_ID on $NETWORK …"

soroban contract read \
  --id "$CONTRACT_ID" \
  --key "$KEY" \
  --network "$NETWORK"
