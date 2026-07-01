# Example: University Admissions Queue

LineProof can manage transparent waitlists for oversubscribed university programmes.

## Use Case

Universities receive far more qualified applications than available seats. A transparent, auditable waitlist builds trust with applicants and regulators.

## Configuration

```typescript
const queueAddress = await factory.createQueue({
  slug: 'cs-msc-2026-waitlist',
  name: 'Computer Science MSc 2026 — Waitlist',
  maxPositions: 200,
  enrollmentOpenAt: admissionsOpenTimestamp,
  enrollmentCloseAt: admissionsCloseTimestamp,
  advancementRule: AdvancementRule.PRIORITY_TIER, // GPA-weighted priority
  escrowRequired: false,
});
```

## Priority Tiers

When using `AdvancementRule.PRIORITY_TIER`, the operator assigns tier weights off-chain (e.g. academic merit, financial need) and submits advancement proofs. The on-chain record captures which tier each position belongs to, but raw application data stays off-chain.

## Transparency Benefits

- Applicants can independently verify their waitlist position
- Regulators can audit the advancement order
- No opaque exceptions — all transitions recorded on-chain

## Key Properties

| Property | Value |
|----------|-------|
| Advancement rule | Priority Tier |
| Escrow | Not required |
| Transferable | No |
| Auditable | Yes |
