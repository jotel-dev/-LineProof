# Privacy Considerations

LineProof is designed so that personal data never reaches the blockchain.

## What Goes On-Chain

| Data | On-chain? | Notes |
|------|-----------|-------|
| Stellar public key (identity) | ✓ Yes | Used as queue position owner |
| Enrollment timestamp | ✓ Yes | Ledger-anchored for auditability |
| Proof hash | ✓ Yes | Opaque commitment, not raw data |
| Queue slug and name | ✓ Yes | Operator-chosen identifiers |
| Escrow amount and asset | ✓ Yes | Required for verifiable fund holds |
| Name, email, passport number | ✗ No | Must stay off-chain |
| IP address, device fingerprint | ✗ No | Must stay off-chain |
| Documents or attachments | ✗ No | Must stay off-chain |

## Identity Binding Model

The current model binds a Stellar public key to a queue. This is the weakest
identity guarantee — an attacker with multiple wallets can create multiple
positions. Stronger options planned:

- **Hash commitment** — hash a real-world identifier (passport number + salt)
  and use the hash as the on-chain identity. The operator verifies off-chain.
- **Attestation** — a trusted third party signs a claim about the identity,
  which the contract verifies on-chain without seeing raw data.
- **ZK proof** — a zero-knowledge proof that the identity satisfies a predicate
  (e.g. "is a unique human") without revealing which human.

## Off-Chain Data Handling

Operators who collect personal data (names, documents) for verification must:

1. Store it in a secure, access-controlled system separate from the contract.
2. Not log or persist it in the LineProof backend API.
3. Apply data minimisation — collect only what is necessary.
4. Comply with applicable privacy regulations (GDPR, CCPA, etc.).
5. Provide a clear retention and deletion policy to applicants.

## Audit vs Privacy Trade-off

On-chain audit trails reveal enrollment order and timestamps publicly.
This is intentional — transparency is the core value proposition.
Operators must communicate this clearly to participants before enrollment.

## Future Work

- Privacy-preserving attestations using Semaphore or similar
- Configurable public/private queue modes
- Encrypted proof commitments with operator-controlled decryption keys
