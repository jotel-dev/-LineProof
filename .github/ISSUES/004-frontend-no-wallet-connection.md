# [Frontend] No wallet connection — enrollment uses raw text input instead of Freighter

**Labels:** `frontend`, `enhancement`, `ux`

---

## Problem

Three issues make the enrollment flow insecure and unfriendly in production:

1. **`frontend/src/pages/QueuePage.tsx` — raw text input for public key**
   Users type their Stellar public key into a plain `<input>` field. This is error-prone (typos cause silent failures) and insecure (users may paste secret keys by mistake). The `.env.example` already defines `VITE_ENABLE_FREIGHTER=true` but no Freighter integration exists anywhere in the codebase.

2. **`frontend/src/hooks/useEnrollment.ts` — identity not verified before submission**
   The hook submits the raw string from the form directly to the API without any on-chain signing. In a production flow, the enrollment transaction must be signed by the private key corresponding to the public key, otherwise any user can enroll on behalf of any address.

3. **No wallet context or provider**
   There is no `WalletContext`, `WalletProvider`, or equivalent in `frontend/src/`. Other pages (`DashboardPage`, `HomePage`) also benefit from knowing the connected wallet — the current architecture makes it impossible to share wallet state across routes.

---

## Solution

- Add `@stellar/freighter-api` to `frontend/package.json`.
- Create `frontend/src/context/WalletContext.tsx` with `connect()`, `disconnect()`, `publicKey`, and `isConnected` state.
- Add a **Connect Wallet** button to the navbar in `frontend/src/App.tsx` that calls `requestAccess()` via the Freighter API.
- Replace the raw text input in `QueuePage.tsx` with a flow that:
  - Shows the connected public key when Freighter is connected
  - Falls back to manual input with a clear warning when Freighter is unavailable
- Export `useWallet` hook from the context for use in `DashboardPage` and `QueuePage`.

---

## Acceptance Criteria

- [ ] `@stellar/freighter-api` added to frontend dependencies
- [ ] `WalletContext` provides `connect`, `disconnect`, `publicKey`, `isConnected`
- [ ] Navbar shows **Connect Wallet** / connected address toggle
- [ ] `QueuePage` auto-fills public key from connected wallet when available
- [ ] `DashboardPage` lookup auto-fills from connected wallet
- [ ] Manual key input still available as fallback with a warning label
- [ ] No new TypeScript errors introduced

---

## Note for Contributors

If you're assigned to this issue, your PR description must include: a screenshot of the connected wallet state in the navbar, a screenshot of the QueuePage with auto-filled public key, and an explanation of how you handled the case where Freighter is not installed in the browser.
