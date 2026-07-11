# T01 — Adopt or defer the architecture-audit findings

Type: wayfinder:grilling (HITL)
Status: closed (2026-07-12)
Assignee: Amsal (session 2026-07-12)
Blocked-by:

## Question

The /improve architecture audit (run 2026-07-12) produced 8 vetted findings and 7 executor-grade plan files. Which findings do we adopt, which do we defer, and do any change the Hallmark plan or the data-section build (e.g. plan 002's `lib/league-queries.ts` layering)? Note two findings are security-shaped (burned credentials in the JS bundle; unguarded `/admin` + no per-handler auth) — the adoption question for those is *when*, not *whether*.

## Assets

- [Audit report](../assets/T01-architecture-audit-report.md) — findings table + rejected items + operator actions
- [plans/README.md](../../plans/README.md) and `plans/001`–`007` — self-contained implementation plans

## Resolution (2026-07-12, owner-confirmed)

- **All seven plans adopted** (001–007). Ordering decided in T02.
- **Credential rotation: risk accepted for now.** The two burned `NEXT_PUBLIC_*` credentials stay live until the owner rotates them; plan 004 still ships (stops future bundling) but does not un-burn the current keys. Revisit at 004 deploy.
- Session-time contradiction: no decision needed — spec amendment A12 (owner-confirmed) fixes 8:00 PM; `lib/calendar.ts` 5:30 PM and the `lib/session.ts` comment are bugs, folded into plan 007's doc/code alignment.
- No interaction between plan 002's league query layer and the data section (news engine + static HTML).
