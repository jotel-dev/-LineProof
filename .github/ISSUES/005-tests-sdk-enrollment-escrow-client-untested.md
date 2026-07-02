# [Tests] SDK EnrollmentClient and EscrowClient have no meaningful unit tests

**Labels:** `tests`, `sdk`, `good first issue`

---

## Problem

Three test gaps exist in `sdk/tests/`:

1. **`EnrollmentClient` is barely tested**
   `sdk/tests/sdk.test.ts` only verifies that `enroll()` throws `MISSING_CREDENTIALS` when no private key is set. The `cancel()` method has zero tests. The `isEnrolled()` method (which currently throws `NOT_IMPLEMENTED`) is also untested — when it is eventually implemented, there is nothing to prevent a regression.

2. **`EscrowClient` only tests the `deposit()` amount guard**
   The single test in `sdk/tests/sdk.test.ts` confirms that a zero amount throws. `release()` and `refund()` are completely untested. There is no test that verifies the correct Soroban contract function name (`"release"`, `"refund"`) is passed to `Operation.invokeContractFunction`.

3. **`sdk/src/utils.ts` `generateTestKeypair()` is untested**
   The helper is exported but never verified. A future refactor could silently break it.

---

## Solution

- Add a dedicated `sdk/tests/enrollment.test.ts`:
  - Test `enroll()` with missing credentials
  - Test `cancel()` with missing credentials
  - Test `isEnrolled()` throws `NOT_IMPLEMENTED` (future-proof regression guard)
  - Mock `@stellar/stellar-sdk` so no network calls occur

- Add a dedicated `sdk/tests/escrow.test.ts`:
  - Test `deposit()` rejects zero amount
  - Test `deposit()` rejects negative amount
  - Test `release()` and `refund()` throw `MISSING_CREDENTIALS` when no private key
  - Spy on `Operation.invokeContractFunction` to verify the correct function name is passed

- Add `generateTestKeypair` test to `sdk/tests/utils.test.ts`:
  - Returns an object with `publicKey` starting with `G`
  - Returns an object with `secretKey` starting with `S`
  - Two calls return different keypairs

---

## Acceptance Criteria

- [ ] `sdk/tests/enrollment.test.ts` covers enroll, cancel, and isEnrolled
- [ ] `sdk/tests/escrow.test.ts` covers deposit validation, release, and refund
- [ ] `generateTestKeypair` tested in `utils.test.ts`
- [ ] All tests use mocks — no real network calls
- [ ] `pnpm test` in `sdk/` passes with zero failures
- [ ] No `any` type assertions in test files

---

## Note for Contributors

If you're assigned to this issue, your PR description must explain the mocking strategy used for `@stellar/stellar-sdk`, show the complete `pnpm test` output, and note any edge cases you discovered while writing the tests that were not covered by the original implementation.
