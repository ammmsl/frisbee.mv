# Plan 003: Close the /admin proxy bypass and add handler-level auth

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a19e878..HEAD -- proxy.ts lib/auth.ts lib/league-auth.ts app/api/admin app/api/league/admin app/admin/page.tsx`
> On any drift, compare the excerpts below to live code; mismatch → STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (independent of 001/002; touches different files)
- **Category**: security
- **Planned at**: commit `a19e878`, 2026-07-12

## Why this matters

All admin authorization lives in a single edge file, `proxy.ts`, and it has a
hole: the guard uses `pathname.startsWith('/admin/')`, which is false for the
exact path `/admin`, so `GET /admin` serves the admin dashboard shell to
anonymous users today. No API handler re-verifies the JWT, so any future
matcher regression or route restructure silently exposes unauthenticated
database writes — including `DELETE /api/league/admin/fixtures`, which wipes a
season's fixtures. Additionally `lib/league-auth.ts` reads its JWT secret
without any guard: if `LEAGUE_JWT_SECRET` is unset, tokens are signed with the
encoding of the literal string `"undefined"` — a predictable key.

## Current state

`proxy.ts:16-53` (Next 16 proxy convention; runs on matcher
`['/admin/:path*', '/api/admin/:path*', '/league/admin/:path*', '/api/league/admin/:path*']`):

```ts
if (pathname.startsWith('/league/admin/') || pathname.startsWith('/api/league/admin/')) {
  ...
}
if (pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
  ...
}
return NextResponse.next()
```

The matcher `'/admin/:path*'` DOES run on the exact path `/admin`, but both
`startsWith('/admin/')` checks fail on it, so it falls through to
`NextResponse.next()`. `app/admin/page.tsx:6` renders with no session check.
(`/league/admin` doesn't leak only because `app/league/admin/page.tsx:4`
redirects to the protected dashboard.)

Auth libs:

- `lib/auth.ts` — `JWT_SECRET`, cookie const `COOKIE_NAME = 'frisbee_admin_session'`,
  `verifyAdminToken(token)` **throws** on failure. No cookie/session helper.
- `lib/league-auth.ts` — `LEAGUE_JWT_SECRET` (line 4, **no** guard/assertion),
  cookie `'ufa_admin_session'`, `verifyAdminToken(token)` returns **boolean**,
  has `getAdminSession(): Promise<boolean>` reading `cookies()` from
  `next/headers`. Exports `COOKIE_NAME_EXPORT`.

API handlers perform zero auth (verified: no `verifyAdminToken`/
`getAdminSession` call in any file under `app/api/admin/` or
`app/api/league/admin/` except the login routes issuing tokens).

Also in scope (small, same files): `app/api/league/admin/login/route.ts:6`
destructures `await req.json()` with no try/catch (malformed JSON → unhandled
500) and line 13-15 uses `process.env.LEAGUE_ADMIN_PASSWORD_HASH!` (unset →
unhandled throw), while the frisbee login route handles both cleanly — mirror
the frisbee behavior. Cookie flags: frisbee login sets `secure: true`
unconditionally; league sets `secure: process.env.NODE_ENV === 'production'`.
Standardize both on the league form (works in local dev over http).

Repo conventions: error responses are
`NextResponse.json({ error: '...' }, { status: NNN })`; Next 16 async params
(`const { param } = await params`); no `<form>` elements.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `npm install`      | exit 0              |
| Typecheck | `npx tsc --noEmit` | exit 0              |
| Build     | `npm run build`    | exit 0              |

## Scope

**In scope**:
- `proxy.ts`
- `lib/auth.ts` (add `getAdminSession`; add secret guard)
- `lib/league-auth.ts` (add secret guard)
- `app/admin/page.tsx` (defense-in-depth session check)
- Every `route.ts` under `app/api/admin/` and `app/api/league/admin/` except
  the two `login` and one `logout` routes (add guard call)
- `app/api/league/admin/login/route.ts` (json try/catch + hash guard)
- `app/api/admin/login/route.ts` (cookie `secure` flag only)

**Out of scope**:
- Consolidating the two auth systems into one factory — Plan 005.
- Changing cookie names, JWT algorithm, expiry, or the two-realm design.
- `app/pickup/**` (its client-side "auth" is Plan 004).
- Any league page component.

## Git workflow

- Branch: `advisor/003-admin-auth-hardening`
- Short imperative commits, e.g. "Close /admin proxy bypass", "Handler-level
  admin auth guards".
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the exact-path bypass in proxy.ts

Change both guards to also match the base path:

```ts
if (pathname === '/league/admin' || pathname.startsWith('/league/admin/') ||
    pathname === '/api/league/admin' || pathname.startsWith('/api/league/admin/')) {
```

and equivalently for `/admin` + `/api/admin`. Keep the login exemptions as-is.

**Verify**: `npx tsc --noEmit` → exit 0

### Step 2: Fail fast on missing secrets

In `lib/auth.ts` and `lib/league-auth.ts`, replace the bare
`process.env.X`/`process.env.X!` secret reads with a guarded read that throws a
descriptive error when unset, following the existing exemplar in
`lib/db.ts:7-12` (explicit `throw new Error('JWT_SECRET is not set. ...')`).
Keep it lazy (inside a `getSecret()` function called by sign/verify) so merely
importing the module without env vars — e.g. during build — cannot crash.

**Verify**: `npx tsc --noEmit` → exit 0; `npm run build` → exit 0

### Step 3: Add `getAdminSession()` to lib/auth.ts

Mirror `lib/league-auth.ts:25-30`: read `cookies()` from `next/headers`, get
`COOKIE_NAME`, return `false` on missing/invalid token instead of throwing
(wrap the existing throwing `verifyAdminToken` in try/catch).

**Verify**: `npx tsc --noEmit` → exit 0

### Step 4: Handler-level guards

At the top of every non-login/logout handler function (GET/POST/PATCH/PUT/
DELETE) under `app/api/admin/` (files: `events/route.ts`,
`events/[eventId]/route.ts`, `news/route.ts`, `news/[postId]/route.ts`,
`overrides/route.ts`, `overrides/[overrideId]/route.ts`) add:

```ts
if (!(await getAdminSession())) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

using `@/lib/auth`. Same for every handler under `app/api/league/admin/`
(files: `fixtures/route.ts`, `fixtures/[matchId]/route.ts`,
`fixtures/bulk/route.ts`, `holidays/route.ts`, `holidays/[holidayId]/route.ts`,
`results/route.ts`, `results/[matchId]/route.ts`, `season/route.ts`,
`season/status/route.ts`, `teams/route.ts`, `teams/[teamId]/route.ts`) using
`getAdminSession` from `@/lib/league-auth`. Exception: `league/health/route.ts`
is public — do not touch.

**Verify**:
`grep -rL "getAdminSession" app/api/admin app/api/league/admin --include=route.ts`
→ only the two `login/route.ts` and `logout/route.ts` files;
`npx tsc --noEmit` → exit 0

### Step 5: Defense-in-depth on the admin dashboard page

In `app/admin/page.tsx`, make the component async, call `getAdminSession()`
from `@/lib/auth`, and `redirect('/admin/login')` (import from
`next/navigation`) when false. This is a server component — no `'use client'`.

**Verify**: `npx tsc --noEmit` → exit 0

### Step 6: League login robustness + cookie-flag alignment

In `app/api/league/admin/login/route.ts`: wrap `await req.json()` in try/catch
returning `{ error: 'Invalid JSON' }, { status: 400 }` (copy the pattern from
`app/api/admin/events/route.ts:7-12`); guard
`process.env.LEAGUE_ADMIN_PASSWORD_HASH` — if unset return a 500 with
`{ error: 'Server configuration error' }` (mirror
`app/api/admin/login/route.ts:19-23`). In `app/api/admin/login/route.ts`
change `secure: true` to `secure: process.env.NODE_ENV === 'production'`.

**Verify**: `npx tsc --noEmit` → exit 0; `npm run build` → exit 0

## Test plan

No test framework exists. Machine gates above, plus manual smoke if `.env.local`
is configured: with no cookie, `curl -i http://localhost:3000/admin` → 307 to
`/admin/login`; `curl -i -X POST http://localhost:3000/api/admin/events` → 401;
`curl -i -X DELETE http://localhost:3000/api/league/admin/fixtures` → 401;
login flow still works via the admin UI.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0; `npm run build` exits 0
- [ ] `grep -n "pathname === '/admin'" proxy.ts` → 1 match (and league
      equivalent present)
- [ ] `grep -rL "getAdminSession" app/api/admin app/api/league/admin --include=route.ts`
      lists only login/logout routes
- [ ] `grep -n "process.env.JWT_SECRET!" lib/auth.ts` → 0 matches;
      `grep -n "LEAGUE_JWT_SECRET" lib/league-auth.ts` shows a guarded read
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `proxy.ts` no longer matches the excerpt (someone already fixed the bypass) —
  report which steps remain relevant instead of re-applying.
- Making the secret read lazy breaks the build in a way you cannot resolve by
  keeping module-level state uninitialized until first call — STOP, report.
- Any handler already contains its own auth logic that conflicts with the
  guard — report rather than stacking checks.

## Maintenance notes

- Every new admin API route must call `getAdminSession()` first — the proxy is
  a convenience layer, not the security boundary.
- Reviewer: confirm no GET league-admin route that admin *pages* call
  server-side got broken — admin pages fetch these endpoints with the browser
  cookie, so handler guards are transparent to them.
- Deferred to Plan 005: single auth factory so these two libs stop drifting.
