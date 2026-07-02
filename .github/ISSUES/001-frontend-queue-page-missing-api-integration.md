# [Frontend] QueuePage and DashboardPage miss live API error recovery and loading states

**Labels:** `bug`, `frontend`, `ux`

---

## Problem

Three concrete issues exist in the frontend's data-fetching layer:

1. **`frontend/src/pages/QueuePage.tsx` — stale `React` import**
   The file uses `React.useState` and `React.FormEvent` but the `React` namespace import is missing at the top; it is only available as a side-effect because the `import React from 'react'` statement is placed at the *bottom* of the file inside a `function Stat` block, which is invalid and will fail in strict ESM environments.

2. **`frontend/src/hooks/useQueues.ts` — no retry on transient network failure**
   If the `/api/queues` fetch fails with a 5xx or a network timeout the hook sets `error` and permanently stops. There is no retry mechanism, so a momentary blip leaves the page broken until the user manually refreshes.

3. **`frontend/src/pages/DashboardPage.tsx` — `lookup()` called with empty key**
   The `lookup` function in `DashboardPage` does not guard against an empty `publicKey` string before firing the `fetch`. Pressing **Lookup** with an empty input sends `GET /api/enrollments/%20` (URL-encoded space or empty string) to the backend, which returns a 404 that is shown as an error rather than a friendly validation message.

---

## Solution

- Move the `import React from 'react'` to the top of `QueuePage.tsx` and remove the misplaced bottom declaration.
- Add a simple exponential-backoff retry (max 3 attempts) to `useQueues` and `useQueue` hooks using `setTimeout`.
- Add a `publicKey.trim().length > 0` guard in `DashboardPage.lookup()` that shows an inline "Enter a public key first" message instead of firing the request.

---

## Acceptance Criteria

- [ ] `QueuePage.tsx` compiles without TS errors and React hooks work correctly in the browser
- [ ] `useQueues` retries up to 3 times with 1s / 2s / 4s backoff before setting `error`
- [ ] `DashboardPage` shows a validation message when the input is blank and does not call the API
- [ ] All existing frontend components still render without console errors
- [ ] No new `any` type assertions introduced

---

## Note for Contributors

If you're assigned to this issue, write a clear and detailed PR description. Explain what was changed in each file, why the original code was broken, how you implemented the retry logic (include the backoff algorithm), and attach a screenshot of the DashboardPage validation message in action.
