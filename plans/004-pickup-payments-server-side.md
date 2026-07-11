# Plan 004: Move pickup payments data server-side; stop shipping credentials in the bundle

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a19e878..HEAD -- app/pickup/payments lib/sheets.ts`
> On any drift, compare the excerpts below against live code; mismatch → STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (reworks the payments page data path; needs behavior parity)
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `a19e878`, 2026-07-12

## Why this matters

The pickup Payment Tracker ships two credentials to every visitor's browser:

1. `app/pickup/payments/_components/AdminGate.tsx:8` embeds
   `process.env.NEXT_PUBLIC_ADMIN_PASSWORD` — a plaintext admin password — into
   the client JS bundle, compares it in the browser (`:22`, `:31`), and writes
   the raw password to `localStorage` (`:32`). Anyone can read it from the
   bundle.
2. `app/pickup/payments/_lib/sheets.ts:4-5` embeds `NEXT_PUBLIC_SHEETS_API_KEY`
   and `NEXT_PUBLIC_SHEET_ID`; the browser fetches four spreadsheet tabs
   directly from the Google Sheets API (`:26-31`), including the `Payments`
   tab (account numbers, transaction references — see column map in
   `_lib/constants.ts:24-37`).

Both credential values must be treated as burned and rotated. This plan moves
the sheet fetch behind a server API route (credential stays server-side, adds
caching), and moves the admin password check to the server. It also violates
the project rule "all public pages server-rendered / data only via server
components or API routes" (CLAUDE.md rule 2) — this plan brings the page into
compliance via the API-route path while keeping the interactive client UI.

## Current state

- `app/pickup/payments/page.tsx` — thin wrapper rendering `PaymentTracker`.
- `app/pickup/payments/PaymentTracker.tsx` — `'use client'`; `loadData()`
  (lines 25-36) calls `fetchAllSheets()` in a `useEffect`; holds
  `AppData | null` state; views: welcome / user / admin-gate / admin.
- `app/pickup/payments/_lib/sheets.ts` — client module (excerpt):

```ts
const API_KEY = process.env.NEXT_PUBLIC_SHEETS_API_KEY!;
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID!;
...
export async function fetchAllSheets(): Promise<AppData> {
  const base = `${SHEETS_BASE_URL}/${SHEET_ID}/values`;
  const key = `key=${API_KEY}`;
  const [summaryRes, attendanceRes, paymentsRes, sessionInputRes] = await Promise.all([
    fetchWithRetry(`${base}/Summary%20Sheet?${key}`), ...
```

  It then filters rows and derives `users` and `years` (lines 33-64), returning
  `AppData` (`_lib/types.ts`).
- `app/pickup/payments/_components/AdminGate.tsx` — modal comparing input to
  `NEXT_PUBLIC_ADMIN_PASSWORD`, persisting the password itself under
  `ADMIN_AUTH_KEY` (`'ufaAdminAuth'`, `_lib/constants.ts:65`).
- `lib/sheets.ts` — existing SERVER-side Google Sheets access (service-account
  JWT via `jose`, `unstable_cache` 300 s). Its `getSessionDates` is live
  (used by `lib/calendar.ts:1`); its private `getGoogleAccessToken()` shows the
  service-account pattern. NOTE: the service account may not be configured in
  production — the payments sheet currently works via the public API key. This
  plan therefore keeps the API key as the mechanism but moves it server-side.
- Existing exemplar API route with caching + graceful failure:
  `app/api/calendar/route.ts` (`export const dynamic = 'force-dynamic'`,
  returns `NextResponse.json`).
- Repo conventions here: semicolons + single quotes in `app/pickup/**`;
  `AppData` type in `_lib/types.ts`; no `<form>` elements (use onClick/onKeyDown
  handlers — AdminGate already complies); admin auth cookie pattern in
  `app/api/admin/login/route.ts` (bcrypt compare against a `*_PASSWORD_HASH`
  env var, `NextResponse.json({ error }, { status })` shapes).

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `npm install`      | exit 0              |
| Typecheck | `npx tsc --noEmit` | exit 0              |
| Build     | `npm run build`    | exit 0              |

## Scope

**In scope**:
- `app/api/pickup/sheets/route.ts` (create)
- `app/api/pickup/admin/verify/route.ts` (create)
- `app/pickup/payments/_lib/sheets.ts` (rewrite as thin client of the new route)
- `app/pickup/payments/_components/AdminGate.tsx` (server-verified password)
- `app/pickup/payments/_lib/constants.ts` (only if a constant must move)
- `.env.local` keys are NOT edited by you — list required new vars in your
  completion report: `SHEETS_API_KEY`, `SHEET_ID`, `PICKUP_ADMIN_PASSWORD_HASH`.

**Out of scope**:
- `AdminDashboard`, `UserDashboard`, charts, `adminMetrics.ts`, `ledger.ts` —
  they consume `AppData` and must keep working unchanged.
- `lib/sheets.ts` (calendar path) — do not modify.
- Per-user data scoping (every visitor still receives the full `AppData`; see
  maintenance notes).
- Rotating the credentials themselves (operator action; you only remove them
  from the bundle).

## Git workflow

- Branch: `advisor/004-pickup-server-side`
- Short imperative commits. Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Server route for sheet data

Create `app/api/pickup/sheets/route.ts`:

- `export const dynamic = 'force-dynamic'`
- Move the ENTIRE body of `fetchAllSheets` (including `fetchWithRetry` and the
  row filtering/derivation, lines 7-64 of `_lib/sheets.ts`) into this route,
  reading `process.env.SHEETS_API_KEY` and `process.env.SHEET_ID` (server-only,
  NO `NEXT_PUBLIC_` prefix). Keep importing `ATT, SUM, SESSION, SHEETS_BASE_URL`
  and `AppData, RawRow` types from `../../../pickup/payments/_lib/...` (or move
  the pure helpers if the import direction feels wrong — but types/constants
  are shared, not page-private).
- Wrap the fetch+derive in `unstable_cache(..., ['pickup-sheets'], { revalidate: 300 })`
  so 167 players don't fan out to Google per page view.
- On success: `NextResponse.json(appData)`. On failure: `NextResponse.json({ error: 'Could not load payment data' }, { status: 502 })`
  (do not leak upstream error bodies).
- If `SHEETS_API_KEY`/`SHEET_ID` are unset: same 502 with a `console.warn`,
  matching the graceful pattern in `lib/sheets.ts:48-56`.

**Verify**: `npx tsc --noEmit` → exit 0

### Step 2: Point the client at the internal route

Rewrite `app/pickup/payments/_lib/sheets.ts` to:

```ts
import type { AppData } from './types';

export async function fetchAllSheets(): Promise<AppData> {
  const res = await fetch('/api/pickup/sheets');
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
```

Delete the `NEXT_PUBLIC_*` reads, `fetchWithRetry`, and the direct Google URL
construction from this file (they now live in the route). `PaymentTracker.tsx`
needs no changes — same function name, same `AppData` promise.

**Verify**: `grep -rn "NEXT_PUBLIC_SHEETS_API_KEY\|NEXT_PUBLIC_SHEET_ID" app/` → 0 matches;
`npx tsc --noEmit` → exit 0

### Step 3: Server-side admin password verification

Create `app/api/pickup/admin/verify/route.ts` (POST):

- Parse JSON with try/catch (copy `app/api/admin/events/route.ts:7-12` pattern);
  expect `{ password: string }`.
- `bcrypt.compare(password, process.env.PICKUP_ADMIN_PASSWORD_HASH)` — import
  `bcrypt from 'bcryptjs'` like `app/api/admin/login/route.ts`. Unset hash →
  500 `{ error: 'Server configuration error' }`. Mismatch → 401. Match →
  `{ ok: true }`.
- Add a simple in-memory rate limit map (IP → attempts) modeled on
  `app/api/contact/route.ts` (it already implements 5/IP/hour in-memory).

Update `AdminGate.tsx`: remove the `NEXT_PUBLIC_ADMIN_PASSWORD` constant;
`handleSubmit` now `await fetch('/api/pickup/admin/verify', { method: 'POST', body: JSON.stringify({ password: input }) })`;
on `ok`, store the literal string `'ok'` under `ADMIN_AUTH_KEY` (never the
password) and call `onAuthenticated()`. The `useEffect` mount check becomes
`localStorage.getItem(ADMIN_AUTH_KEY) === 'ok'`.

**Verify**: `grep -rn "NEXT_PUBLIC_ADMIN_PASSWORD" app/` → 0 matches;
`npx tsc --noEmit` → exit 0

### Step 4: Full build + report rotation requirements

**Verify**: `npm run build` → exit 0. In your completion report, state
explicitly: (1) the old Google API key and admin password are burned (they
shipped in public bundles) and MUST be rotated by the operator; (2) new
server-side env vars required: `SHEETS_API_KEY` (rotated key, referrer/API
restrictions applied in Google Cloud console), `SHEET_ID`,
`PICKUP_ADMIN_PASSWORD_HASH` (bcrypt hash of the NEW password — the repo's
`hash-password.mjs` pattern from BUILD-PROGRESS docs can generate it).

## Test plan

No test framework. Gates: greps + typecheck + build. Manual smoke (needs env
vars locally): `/pickup/payments` loads player list; selecting a player shows
the user dashboard; wrong admin password → error message; correct password →
admin dashboard; `curl http://localhost:3000/api/pickup/sheets` returns JSON
with `users` array; view-source of the page bundle contains neither the sheet
key nor any password.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0; `npm run build` exits 0
- [ ] `grep -rn "NEXT_PUBLIC_SHEETS_API_KEY\|NEXT_PUBLIC_SHEET_ID\|NEXT_PUBLIC_ADMIN_PASSWORD" app/ lib/` → 0 matches
- [ ] `app/api/pickup/sheets/route.ts` and `app/api/pickup/admin/verify/route.ts` exist
- [ ] `grep -n "localStorage.setItem(ADMIN_AUTH_KEY, input)" app/pickup/payments/_components/AdminGate.tsx` → 0 matches
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated; rotation requirements stated in report

## STOP conditions

- `AppData`'s derivation (users/years filtering) turns out to depend on
  browser-only APIs — it doesn't per the current code, but if you find any,
  STOP.
- The proxy (`proxy.ts`) matcher would intercept `/api/pickup/*` — it should
  not (matcher covers only admin paths); if it does, STOP and report.
- You are tempted to keep a `NEXT_PUBLIC_` fallback "for compatibility" — do
  not; that defeats the plan. STOP and report if something seems to need it.

## Maintenance notes

- The admin *view* is still client-toggled; what changed is that no credential
  ships in the bundle and the data fetch is server-cached. Every visitor still
  receives the full `AppData` (including the Payments tab). If that data is
  considered sensitive, a follow-up should split `/api/pickup/sheets` into a
  public subset and an authenticated admin subset — deliberately deferred.
- `lib/sheets.ts#getPaymentStatus` is now confirmed dead (nothing consumes it);
  Plan 006 deletes it. If a future consolidation adopts the service account for
  the payments route too, reuse `lib/sheets.ts`'s token flow.
- Reviewer: confirm `fetchWithRetry` semantics (3 tries, backoff) were either
  preserved in the route or intentionally dropped in favor of the 300 s cache.
