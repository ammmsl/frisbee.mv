# T02 — Lock the implementation sequence across the three plans

Type: wayfinder:grilling (HITL)
Status: closed (2026-07-12)
Assignee: Amsal (session 2026-07-12)
Blocked-by: T01

## Question

In what order do the work packages land: Hallmark Phase 1 (bugs) / Phase 2 (chrome) / Phase 3 (per-page macros), the 18 site amendments (spec §6), the data section build, and adopted audit findings? Sub-decisions: (a) do the §6 amendments ride with Hallmark Phase 1 as one "correctness" pass or ship separately first; (b) resolve the 3,481-vs-4,906 attendance-stat conflict — spec wins on the number, decide the refresh mechanism (Sheets verify-once vs DB-derived); (c) does the data section wait for the new chrome (Phase 2) or launch on the current design?

## Resolution (2026-07-12, owner-confirmed)

The locked sequence — six waves, each shippable on its own:

1. **Wave 1 — Correctness & security (one pass, one branch):** audit plans 001 (league cache invalidation + key collisions), 003 (admin hardening), 004 (payments server-side) + Hallmark Phase 1 (bug items) + all 18 spec §6 amendments.
   - Hallmark Phase 1 item #8 (verify the 3,481 stat) is **superseded**: home-page stats become a **live server-side fetch** (cached, via plan 004's server Sheets machinery / `lib/sheets.ts`) with labelled denominators per the spec's standing rule. Never hardcode counts again.
   - Credentials: rotation deferred (T01 risk-acceptance); 004 ships without it.
2. **Wave 2:** audit plan 002 — centralize league data access into `lib/league-queries.ts` (depends 001).
3. **Wave 3:** Hallmark Phase 2 — chrome rebuild (Fraunces, N6 masthead, Ft5 footer, tinted paper, league bridge, drop lucide-react).
4. **Wave 4:** Data section build (needs T03/T04/T05/T06 resolved; launches on the new chrome).
5. **Wave 5:** Hallmark Phase 3 — per-page macrostructures, one PR per page, home first.
6. **Wave 6:** audit plans 005 (infra dedup) → 006 (dead code + tooling) → 007 (CLAUDE.md rewrite). 007 may float earlier if stale docs start misdirecting sessions; its dependencies (001/002) clear after Wave 2.

Sub-decisions: (a) §6 amendments ride with Hallmark Phase 1 — one correctness pass; (b) stats = live server-side fetch, not snapshot; (c) data section waits for the new chrome.

Planning tickets (T03–T06) are not gated by the waves — resolve them anytime; only the Wave 4 *build* waits on them.
