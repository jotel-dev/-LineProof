# Example: Healthcare Scheduling

This example demonstrates LineProof applied to a public-health appointment queue — for example, vaccination slots or specialist consultations.

## Use Case

A health authority needs to allocate limited appointment slots fairly across a large applicant pool. The queue must be:

- Non-transferable (slots cannot be resold)
- Auditable (any observer can verify the enrollment order)
- Identity-bound (one slot per patient identity)

## Queue Configuration

```typescript
import { LineProofClient, AdvancementRule, NetworkPassphrase } from '@lineproof/sdk';

const client = new LineProofClient({
  networkPassphrase: NetworkPassphrase.TESTNET,
  rpcServerUrl: 'https://soroban-testnet.stellar.org',
  privateKey: process.env.STELLAR_PRIVATE_KEY,
});

const factory = await client.deployFactory();

const queueAddress = await factory.createQueue({
  slug: 'vaccination-batch-jul-2025',
  name: 'Vaccination Batch — July 2025',
  maxPositions: 1000,
  enrollmentOpenAt: Math.floor(Date.now() / 1000),
  enrollmentCloseAt: Math.floor(Date.now() / 1000) + 7 * 86400, // 7 days
  advancementRule: AdvancementRule.FIRST_IN_FIRST_OUT,
  escrowRequired: false, // No payment required for public health
});

console.log('Queue deployed at:', queueAddress);
```

## Enrollment

Patients enroll using their Stellar public key as their identity. Each key can hold at most one position per queue.

```typescript
const enrollment = client.enrollment();
const proof = await enrollment.enroll(queueAddress, patientPublicKey);
console.log('Enrolled at:', proof.enrolledAt);
console.log('Proof hash:', proof.proofHash);
```

## Advancement

The authority advances patients in FIFO order when appointment slots open:

```typescript
const queue = client.queue(queueAddress);
const advanced = await queue.advance(50); // advance 50 patients
console.log('Advanced position IDs:', advanced);
```

## Audit

Any third party can verify the queue's enrollment history by querying on-chain events:

```bash
soroban events --id $QUEUE_ADDRESS --network testnet \
  --topic lineproof.enrollment
```

## Key Properties

| Property | Value |
|----------|-------|
| Advancement rule | FIFO |
| Escrow | Not required |
| Transferable | No |
| Auditable | Yes — all events on-chain |
| Duplicate enrollment | Rejected by protocol |
