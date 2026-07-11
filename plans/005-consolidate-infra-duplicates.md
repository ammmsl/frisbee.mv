# Plan 005: Consolidate duplicated infrastructure (auth, db client, env validation, config types)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a19e878..HEAD -- lib app/api config app/(site)/governance app/(site)/sponsors`
> Plans 001-004 are expected to have touched lib/ and app/api — re-read the
> live versions of `lib/auth.ts` and `lib/league-auth.ts` before starting
> (Plan 003 adds guards/getAdminSession to them; build on that state).

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (touches auth plumbing used by every admin surface)
- **Depends on**: plans/003-harden-admin-route-protection.md
- **Category**: tech-debt
- **Planned at**: commit `a19e878`, 2026-07-12

## Why this matters

The league-tracker merge left the repo with two of everything at the
infrastructure layer: two JWT auth modules with the same function names but
different contracts, two postgres client modules with different safety
postures, ad-hoc env handling with three different failure modes (silent wrong
key, hard throw at import, graceful degrade), and untyped `as`-cast JSON config.
Each pair must currently be maintained in lockstep by hand. This plan collapses
each pair into one parameterized implementation and makes misconfiguration fail
fast and loudly.

## Current state

### Auth (post-Plan-003 state)

- `lib/auth.ts` — `JWT_SECRET`, cookie `frisbee_admin_session`; after Plan 003:
  guarded secret + `getAdminSession()`.
- `lib/league-auth.ts` — `LEAGUE_JWT_SECRET`, cookie `ufa_admin_session`,
  boolean-returning `verifyAdminToken`, `getAdminSession()`, awkward
  `COOKIE_NAME_EXPORT` alias (`lib/league-auth.ts:32`).
- Consumers: `app/api/admin/login|logout/route.ts`,
  `app/api/league/admin/login/route.ts`, `proxy.ts` (verifies both realms
  inline with its own `isValid()` copy, `proxy.ts:7-14`), plus every handler
  guard added by Plan 003, plus `app/league/match/[matchId]/page.tsx:6`.

### DB clients

`lib/db.ts:5-33` — lazy Proxy-based client, explicit missing-env error, and the
mandated options (`max: 1, ssl: 'require', prepare: false` — a documented hard
rule, do not change the options). `lib/league-db.ts:3-8`:

```ts
const sql = postgres(process.env.LEAGUE_DATABASE_URL ?? process.env.DATABASE_URL!, {
  max: 1,
  ssl: 'require',
  prepare: false,
  connect_timeout: 5,
})
```

— eager instantiation at import time with a `!` assertion (import without env →
throw), no lazy guard.

### Env handling

Non-null `!` assertions on env at module scope: `proxy.ts:4-5`,
`app/api/contact/route.ts:97-98`, `app/api/league/admin/login/route.ts:14`
(fixed by Plan 003), formerly `lib/auth.ts:3`. No `.env.example` exists.
Documented env surface: `DATABASE_URL`, `LEAGUE_DATABASE_URL`, `JWT_SECRET`,
`LEAGUE_JWT_SECRET`, `ADMIN_PASSWORD_HASH`, `LEAGUE_ADMIN_PASSWORD_HASH`,
`CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`, `RESEND_API_KEY`,
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEETS_ID`, plus
Plan 004's `SHEETS_API_KEY`, `SHEET_ID`, `PICKUP_ADMIN_PASSWORD_HASH`.

### Config JSON

`config/board.json`, `committees.json`, `documents.json`, `sponsors.json` are
consumed via `as` casts with per-page inline interfaces:
`app/(site)/governance/page.tsx:11-39` (three interfaces + three casts),
`app/(site)/sponsors/page.tsx:7-16` (`Sponsor` + cast). A typo'd key in the
JSON compiles clean and renders blank. There is also a stray empty file
`config/test` (deleted in Plan 006).

Repo conventions: `lib/` modules are plain TS with named exports; site code
uses semicolons, league code doesn't — for `lib/` follow the file you're
editing; keep `@/lib/...` import alias.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `npm install`      | exit 0              |
| Typecheck | `npx tsc --noEmit` | exit 0              |
| Build     | `npm run build`    | exit 0              |

## Scope

**In scope**:
- `lib/env.ts` (create), `.env.example` (create)
- `lib/auth-core.ts` (create), `lib/auth.ts`, `lib/league-auth.ts` (become
  thin instantiations)
- `lib/db-core.ts` (create) OR refactor inside `lib/db.ts`; `lib/league-db.ts`
- `proxy.ts` (consume the shared verify)
- `config/types.ts` (create); `app/(site)/governance/page.tsx`,
  `app/(site)/sponsors/page.tsx` (import shared types, drop inline interfaces)

**Out of scope**:
- Changing cookie names, secrets, expiry, or merging the two auth *realms* —
  they stay separate; only the implementation is shared.
- The mandated postgres options (`max: 1`, `ssl: 'require'`, `prepare: false`).
- Any route handler logic beyond swapping imports.
- Zod or any new dependency — hand-rolled validation only (repo has no
  validation lib and adding one is not justified for 4 config files).

## Git workflow

- Branch: `advisor/005-infra-consolidation`
- Commit per subsystem (auth / db / env / config). Do NOT push.

## Steps

### Step 1: `lib/env.ts`

Export `function requireEnv(name: string): string` (throws
`Error(\`\${name} is not set — see .env.example\`)` when missing/empty) and
`function optionalEnv(name: string): string | undefined`. Write `.env.example`
listing every var from "Current state → Env handling" with a one-line comment
each and NO real values (placeholders like `postgres://...`).

**Verify**: `npx tsc --noEmit` → exit 0; `.env.example` exists and
`grep -c "=" .env.example` ≥ 14.

### Step 2: Auth factory

Create `lib/auth-core.ts`:

```ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { requireEnv } from './env'

export function createAdminAuth(opts: { secretEnv: string; cookieName: string }) {
  const getSecret = () => new TextEncoder().encode(requireEnv(opts.secretEnv))
  return {
    cookieName: opts.cookieName,
    async sign(): Promise<string> {
      return new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .setIssuedAt()
        .sign(getSecret())
    },
    async verify(token: string): Promise<boolean> {
      try {
        const { payload } = await jwtVerify(token, getSecret())
        return payload.role === 'admin'
      } catch { return false }
    },
    async getSession(): Promise<boolean> {
      const token = (await cookies()).get(opts.cookieName)?.value
      return token ? this.verify(token) : false
    },
  }
}
```

Rewrite `lib/auth.ts` as
`export const adminAuth = createAdminAuth({ secretEnv: 'JWT_SECRET', cookieName: 'frisbee_admin_session' })`
plus backwards-compatible named exports (`COOKIE_NAME`, `signAdminToken`,
`getAdminSession`) delegating to it, and `lib/league-auth.ts` likewise
(`LEAGUE_JWT_SECRET` / `ufa_admin_session`; keep `COOKIE_NAME_EXPORT` as a
deprecated alias so `app/api/league/admin/login/route.ts` keeps compiling, or
update that import and delete the alias — prefer the latter).

CAUTION: `proxy.ts` runs in the edge/proxy runtime — it must NOT import
anything that pulls `next/headers`. Have `proxy.ts` keep its own `jwtVerify`
call but read the two cookie names from a new tiny constants module
(`lib/auth-constants.ts` exporting the two cookie-name strings) so names exist
in exactly one place. Do not import `auth-core` into `proxy.ts`.

**Verify**: `npx tsc --noEmit` → exit 0; `npm run build` → exit 0;
`grep -rn "frisbee_admin_session\|ufa_admin_session" app lib proxy.ts | grep -v auth-constants` →
only usages via the constants (no second string literal of either name).

### Step 3: DB client factory

In `lib/db.ts`, extract the lazy-Proxy pattern into an exported
`function createLazyClient(envVar: string, fallbackEnvVar?: string, extra?: postgres.Options<{}>)`
(same file is fine; a separate `db-core.ts` also acceptable). Rewrite
`lib/league-db.ts` as
`export default createLazyClient('LEAGUE_DATABASE_URL', 'DATABASE_URL', { connect_timeout: 5 })`.
The mandated options stay hardcoded inside the factory.

**Verify**: `npx tsc --noEmit` → exit 0;
`grep -c "postgres(" lib/db.ts lib/league-db.ts` → league-db contains no direct
`postgres(` call; `npm run build` → exit 0.

### Step 4: Config types

Create `config/types.ts` exporting `BoardMember`, `Committee`,
`GovernanceDocument`, `Sponsor` (copy the field definitions from the inline
interfaces at `app/(site)/governance/page.tsx:11-35` and
`app/(site)/sponsors/page.tsx:7-15` — they are the source of truth), plus a
small `assertArrayOf<T>(data: unknown, requiredKeys: (keyof T & string)[], label: string): T[]`
that throws a descriptive error at module load if a required key is missing on
any entry. Update the two pages to import the types and validate:
`const board = assertArrayOf<BoardMember>(boardData, ['name', 'title'], 'config/board.json')`
(pick required keys from the actual interfaces). Delete the inline interfaces.

**Verify**: `npx tsc --noEmit` → exit 0;
`grep -n "as BoardMember\|as Committee\|as GovernanceDocument\|as Sponsor" app` → 0 matches;
`npm run build` → exit 0 (build exercises the validation because these pages
import the JSON at module scope).

### Step 5: Sweep remaining bare `!` env assertions

Replace module-scope `process.env.X!` in `proxy.ts:4-5` and
`app/api/contact/route.ts:97-98` with `requireEnv`/lazy reads (proxy: build the
`Uint8Array` secrets inside the request handler or memoize on first request so
a missing var produces a clear error, not a bogus key).

**Verify**: `grep -rn "process.env.[A-Z_]*!" app lib proxy.ts` → 0 matches;
`npx tsc --noEmit` → exit 0; `npm run build` → exit 0.

## Test plan

No test framework. Gates above, plus manual smoke with `.env.local` configured:
admin login/logout on `/admin/login`, league admin login on
`/league/admin/login` (both realms must still round-trip — the factory must not
change cookie name, algorithm, or claim shape, or every admin is logged out
with no diagnostic), one `(site)` DB page (`/events`), one league page
(`/league`), `/governance` and `/sponsors` render board/committee/sponsor
content.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0; `npm run build` exits 0
- [ ] `grep -rn "process.env.[A-Z_]*!" app lib proxy.ts | wc -l` = 0
- [ ] `.env.example` exists with all documented vars
- [ ] `lib/league-auth.ts` and `lib/auth.ts` each ≤ ~15 lines (thin instantiations)
- [ ] `lib/league-db.ts` contains no direct `postgres(` call
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- Plan 003 has not landed (no `getAdminSession` in `lib/auth.ts`) → STOP,
  execute 003 first.
- Importing `lib/env.ts` from `proxy.ts` fails the build (edge-runtime
  restriction) → keep proxy self-contained and report.
- Any behavioral difference in issued JWTs is required to make tests pass
  (e.g. changing claims) → STOP; the factory must be behavior-preserving.

## Maintenance notes

- New env vars: add to `.env.example` in the same commit that introduces them —
  reviewers should reject PRs that don't.
- The two auth realms are intentionally separate (different secrets/cookies).
  If they are ever merged into one admin, delete `league-auth.ts` and move all
  routes to `lib/auth.ts`'s instance — the factory makes that a small change.
- Reviewer: scrutinize the proxy edge-runtime constraint; `next/headers`
  imports in its dependency graph will break `npm run build`.
