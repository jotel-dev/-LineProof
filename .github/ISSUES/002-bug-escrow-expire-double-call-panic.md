# [Bug] Calling expire() twice on the same escrow record panics with wrong message

**Labels:** `bug`, `contracts`, `soroban`

---

## Problem

Two related bugs exist in `contracts/lineproof-escrow/src/lib.rs`:

1. **Wrong panic message on double expire**
   When `expire()` is called a second time on a record whose status is already `Expired`, the function reaches the `if !matches!(record.status, EscrowStatus::Active)` guard and panics with `"escrow not active"`. This message is technically correct but misleading — callers cannot distinguish "already expired" from "already released" or "already refunded". All three distinct states collapse into the same error string, making error handling on the SDK and backend layers ambiguous.

2. **`expire()` does not validate the caller**
   The `expire()` function in `lib.rs` (lines ~95–106) allows *any* address to trigger expiry — there is no `identity.require_auth()` or admin auth check. This means an attacker can call `expire()` on another user's escrow record as soon as the hold period elapses, forcing the record into `Expired` state and triggering the expiry event before the legitimate participant has a chance to act.

---

## Solution

- Replace the generic `"escrow not active"` panic with specific messages per state:
  - `"escrow already released"`
  - `"escrow already refunded"`
  - `"escrow already expired"`
- Add `identity.require_auth()` to `expire()` so only the escrow owner (or an authorised admin) can trigger expiry. Decide whether to restrict it to admin-only or allow the identity itself to call it.
- Update `contracts/lineproof-escrow/src/test.rs` with tests for each specific panic message.

---

## Acceptance Criteria

- [ ] `expire()` called after `release()` panics with `"escrow already released"`
- [ ] `expire()` called after `refund()` panics with `"escrow already refunded"`
- [ ] `expire()` called twice panics with `"escrow already expired"`
- [ ] `expire()` requires auth from the identity or admin — unauthenticated callers are rejected
- [ ] All existing escrow tests still pass
- [ ] New tests cover every new panic branch

---

## Note for Contributors

If you're assigned to this issue, your PR description must explain the auth decision (identity vs admin vs either), include the updated panic message strings, and show `cargo test -p lineproof-escrow` output confirming all tests pass.
