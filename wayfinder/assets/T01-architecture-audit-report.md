# Architecture audit report (improve skill run, 2026-07-12)

Audited at commit `a19e878` (main). Executor-grade plan files: [`plans/001`–`007` + `plans/README.md`](../../plans/README.md). Verification baseline: no test framework; `npx tsc --noEmit` clean; `npm run lint` broken (`next lint` removed in Next 16).

**Headline:** CLAUDE.md claims the league tracker is a separate repo — it isn't. It was merged in under `app/league/` + `app/api/league/` + `lib/league-*`, and nearly every high-leverage finding is a seam from that merge: two auth systems, two db clients, two Sheets integrations, two caching models, duplicated inline cached loaders, and stale docs.

## Vetted findings (leverage order)

| # | Finding | Category | Impact | Effort | Risk | Confidence |
|---|---------|----------|--------|--------|------|------------|
| 1 | **7 of 11 league admin mutation routes never invalidate the `league` cache tag**, and the cached loaders have **no TTL** — stale forever until an unrelated mutation fires. Missing in: `results/[matchId]`, `teams` POST, `season`, `season/status` (season activation!), `holidays` ×2, `fixtures/bulk`, and the `DELETE` handler of `fixtures/route.ts` (~L67). Present only in `results/route.ts:142`, `fixtures/route.ts:58` (POST), `fixtures/[matchId]:37,60`, `teams/[teamId]:27` | bug | Public league pages show wrong season/schedule/results indefinitely | S | LOW | HIGH |
| 2 | **Cache-key collisions between differently-shaped loaders.** (a) `['league-team-roster']` used by two different queries with the same `(teamId)` arg: `app/league/match/[matchId]/page.tsx:102-114` (id+name) vs `app/league/team/[teamId]/page.tsx:27-47` (adds goals/assists/blocks) — whichever runs first poisons the other. (b) `['league-active-season']` defined in 7 pages with **three different return shapes** — first page rendered after a flush determines the shape all seven receive. Likely root cause of the "unstable caching" commit | bug | Pages render `undefined` fields depending on visit order after each cache flush | S | LOW | HIGH |
| 3 | **Pickup payments ships credentials in the JS bundle**: `NEXT_PUBLIC_ADMIN_PASSWORD` compared in-browser and written raw to localStorage (`app/pickup/payments/_components/AdminGate.tsx:8,22,31-32`); `NEXT_PUBLIC_SHEETS_API_KEY`/`NEXT_PUBLIC_SHEET_ID` used for client-side Sheets fetches incl. the Payments tab with account numbers. Violates CLAUDE.md rule 2. A parallel server-side Sheets client exists (`lib/sheets.ts`) whose `getPaymentStatus` is dead code | security | **Both credentials are burned — must rotate**; payment data fetched by every browser | M | MED | HIGH |
| 4 | **`/admin` exact path bypasses the proxy**: `proxy.ts:37` uses `startsWith('/admin/')` — false for exact `/admin`; `app/admin/page.tsx` has no session check. **No API handler re-verifies auth** — every write endpoint (incl. `DELETE /api/league/admin/fixtures` which wipes a season) trusts `proxy.ts` alone. `lib/league-auth.ts:4` reads `LEAGUE_JWT_SECRET` unguarded — unset ⇒ signs with a predictable key | security | Single point of failure for all admin writes; live info-disclosure on `/admin` | M | LOW | HIGH |
| 5 | **~40 `unstable_cache` loaders defined inline across 11 league page files** — `getActiveSeason` copy-pasted ×7 (drifted), `getCachedStandings` ×4; hand-typed key strings are how finding #2 happened | tech-debt | Every query/key/tag change is an 11-file edit; collision class recurs | M | LOW | HIGH |
| 6 | **Two of everything at the infra layer**: auth (site vs league libs + a third inline verify in `proxy.ts:7-14`; cookie `secure` flags diverge); db (`lib/db.ts` lazy-guarded vs `lib/league-db.ts:3-8` eager `!`-asserted); env (three failure modes; no `.env.example`); config JSON via unvalidated `as` casts with per-page duplicate interfaces | tech-debt | Lockstep maintenance, divergent failure modes, silent misconfiguration | M | MED | HIGH |
| 7 | **CLAUDE.md is actively wrong**: separate-repo claim; route diagram (home at `app/page.tsx`, phantom `api/sheets/`); accent `#FF6B35` vs actual `#469BAF`; env list missing all league/pickup vars; hard rule 5 contradicted by league pages. Also **three contradictory session times**: `lib/session.ts` comments say 17:30, code says 20:00, `lib/calendar.ts:107` hardcodes 5:30 PM | docs/dx | The read-first-every-session file misdirects every future agent | S | LOW | HIGH |
| 8 | **Dead code + broken toolchain**: `app/_dev/` byte-identical to `app/dev-preview/`; `Drawer/Skeleton/Table/SegmentedControl` unused outside showcase; `lib/sheets.ts:87` `getPaymentStatus` dead; stray `config/test`; `"lint": "next lint"` broken on Next 16; `eslint-config-next` 15.2.1 vs next 16.1.6 | tech-debt/dx | ~1,300 dead lines; no working lint gate | S | LOW | HIGH |

**Considered and rejected** (recorded in `plans/README.md`): dual chart libs (accepted debt); `revalidateTag` second arg; standings SQL over-computation (needs EXPLAIN first); build-timeout risk (cleared); god-file refactors (too risky with zero tests); league visual silo (boundary otherwise clean — no cross-imports between `(site)` and `league`).

## Plan files (each executable by a zero-context agent)

1. `plans/001` — Fix league cache invalidation + key collisions (P1, S, no deps)
2. `plans/002` — Centralize league data access into `lib/league-queries.ts` (P1, M, depends 001)
3. `plans/003` — Harden admin route protection (P1, M, independent)
4. `plans/004` — Pickup payments server-side; stop shipping credentials (P1, M, independent)
5. `plans/005` — Consolidate infra duplicates: env/auth/db/config validation (P2, M, depends 003)
6. `plans/006` — Dead code + tooling hygiene (P2, S; step 4 depends 004)
7. `plans/007` — Rewrite CLAUDE.md (P2, S, soft-depends 001/002)

**Recommended order:** 003 + 004 first if security matters most (independent); otherwise 001 → 002 → 003 → 004 → 005 → 006 → 007.

**Two operator actions no plan can perform:** rotate the two burned credentials (`NEXT_PUBLIC_SHEETS_API_KEY`, `NEXT_PUBLIC_ADMIN_PASSWORD`), and settle the session-time contradiction (5:30 PM vs 8:00 PM).
