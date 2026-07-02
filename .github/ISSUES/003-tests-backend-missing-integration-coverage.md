# [Tests] Backend routes lack integration-level test coverage for error paths

**Labels:** `tests`, `backend`, `good first issue`

---

## Problem

Three gaps in the backend test suite leave critical behaviour untested:

1. **No route-level tests for `POST /api/escrow/release` and `POST /api/escrow/refund`**
   `backend/src/__tests__/escrowService.test.ts` tests the service layer in isolation but there are no HTTP-level tests using `supertest` or similar. The validation schema change (`EscrowActionSchema` requiring `escrowId`) introduced in `backend/src/routes/escrow.ts` is completely untested — a regression could ship silently.

2. **`backend/src/routes/enrollments.ts` has no tests for the `GET /enrollments/queue/:queueId` endpoint**
   The new endpoint added in `enrollmentService.ts` (`getEnrollmentsByQueue`) was never covered by any test. Edge cases like an empty queue, a queue with only cancelled enrollments, and a queue that does not exist are all uncovered.

3. **`backend/src/middleware/errorHandler.ts` has no tests**
   The error handler was refactored to return a structured `{ error: { message, status, path, timestamp } }` shape. None of the error shape, status-code forwarding, or stack-trace suppression in production mode is tested.

---

## Solution

- Add `supertest` to `backend` devDependencies.
- Create `backend/src/__tests__/routes/escrow.route.test.ts` covering:
  - `POST /api/escrow/deposit` — valid, duplicate, invalid body
  - `POST /api/escrow/release` — valid, not found, wrong status
  - `POST /api/escrow/refund` — valid, not found
  - `POST /api/escrow/expire` — valid, not yet expired
- Create `backend/src/__tests__/routes/enrollments.route.test.ts` covering:
  - `GET /api/enrollments/queue/:queueId` — with results, empty, cancelled-only
- Create `backend/src/__tests__/errorHandler.test.ts` covering response shape and status forwarding.

---

## Acceptance Criteria

- [ ] `supertest` added to `backend/package.json` devDependencies
- [ ] Escrow route tests cover at least 6 distinct scenarios
- [ ] Enrollment queue endpoint tested for empty, cancelled-only, and populated cases
- [ ] Error handler test verifies `{ error: { message, status, path, timestamp } }` shape
- [ ] All new and existing tests pass with `pnpm test` in the `backend` directory
- [ ] Test coverage for `escrowService.ts` and `enrollmentService.ts` increases

---

## Note for Contributors

If you're assigned to this issue, your PR description must include the `pnpm test --coverage` summary output showing the new coverage numbers, and explain why each test scenario was chosen.
