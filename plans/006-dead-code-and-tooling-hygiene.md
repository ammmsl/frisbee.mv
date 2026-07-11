# Plan 006: Remove dead code and fix the broken lint toolchain

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a19e878..HEAD -- app/_dev app/dev-preview app/_components config/test lib/sheets.ts package.json`
> On drift affecting these paths, re-verify the "zero importers" claims below
> with the greps given before deleting anything.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/004-pickup-payments-server-side.md (only for the
  `getPaymentStatus` deletion — if 004 hasn't landed, skip Step 4 and note it)
- **Category**: tech-debt / dx
- **Planned at**: commit `a19e878`, 2026-07-12

## Why this matters

~1,300 lines of confirmed-dead code ship with the repo: a byte-identical
duplicated dev showcase (one copy unreachable by routing), four shared
components whose only consumer is that showcase, an unused server sheets
helper, and a stray empty config file. Separately, `npm run lint` is broken —
the script still calls `next lint`, which Next 16 removed — and
`eslint-config-next` is pinned to 15.2.1 against Next 16.1.6, so there is no
working lint gate at all.

## Current state

All claims below were verified by repo-wide grep at commit `a19e878`; re-verify
each before deleting (commands inline).

1. `app/_dev/components/ComponentShowcase.tsx` is byte-identical to
   `app/dev-preview/ComponentShowcase.tsx` (`diff` clean, 411 lines each).
   `app/_dev/` uses the Next.js private-folder convention (`_` prefix) so
   `app/_dev/components/page.tsx` is not routable — fully dead. Both page
   files carry a "DELETE THIS FILE before Phase 1 ships" comment.
2. Orphaned shared components — zero importers outside the showcase files:
   `app/_components/Drawer.tsx` (271 lines), `app/_components/Skeleton.tsx`,
   `app/_components/Table.tsx`, `app/_components/SegmentedControl.tsx`.
   NOT orphaned (keep): `Avatar.tsx` (used by `PersonCard.tsx`, which
   `app/(site)/governance/page.tsx` uses), `Toast`, `Modal`, `SearchInput`,
   `QuoteBlock`, `StatTile`, and everything else in `app/_components/`.
3. `lib/sheets.ts:87-129` `getPaymentStatus` — exported, never imported
   (`getSessionDates` in the same file IS live via `lib/calendar.ts:1` — do
   not touch it).
4. `config/test` — stray near-empty file, no references.
5. `package.json:8` — `"lint": "next lint"` (removed in Next 16; command
   fails). `package.json` devDependencies — `"eslint-config-next": "15.2.1"`
   vs `"next": "16.1.6"`. `eslint.config.mjs` uses FlatCompat extending
   `next/core-web-vitals` + `next/typescript`.
6. No `typecheck` script exists; `npx tsc --noEmit` currently exits 0.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `npm install`      | exit 0              |
| Typecheck | `npx tsc --noEmit` | exit 0              |
| Build     | `npm run build`    | exit 0              |

## Scope

**In scope**:
- Delete: `app/_dev/` (whole directory), `app/dev-preview/` (whole directory),
  `app/_components/Drawer.tsx`, `app/_components/Skeleton.tsx`,
  `app/_components/Table.tsx`, `app/_components/SegmentedControl.tsx`,
  `config/test`, the `getPaymentStatus` export in `lib/sheets.ts`
- Edit: `package.json` (scripts + eslint-config-next bump)

**Out of scope**:
- `app/_components/Avatar.tsx` and every other shared component (alive).
- `chart.js`/`recharts` dual-dependency consolidation — considered and
  REJECTED for now (L effort to port league's two recharts components to
  chart.js for a modest bundle win; both areas work; record as accepted debt).
- `html2canvas` (alive: `app/pickup/draft/TeamDrafter.tsx`).
- Fixing any lint errors the new config surfaces beyond obvious mechanical
  ones — report large rule-violation counts instead of mass-editing.

## Git workflow

- Branch: `advisor/006-dead-code-tooling`
- One commit for deletions, one for tooling. Do NOT push.

## Steps

### Step 1: Re-verify then delete the showcases

`grep -rn "dev-preview\|_dev/" app --include=*.tsx | grep -v "app/_dev\|app/dev-preview"`
→ expect 0 matches (nothing links to them). Then delete `app/_dev/` and
`app/dev-preview/` entirely.

**Verify**: `npx tsc --noEmit` → exit 0

### Step 2: Re-verify then delete the four orphaned components

For each of Drawer, Skeleton, Table, SegmentedControl:
`grep -rn "components/Drawer'\|/Drawer'" app --include=*.tsx` (adjust name) →
expect 0 matches after Step 1. Delete the four files.

**Verify**: `npx tsc --noEmit` → exit 0; `npm run build` → exit 0

### Step 3: Delete `config/test`

**Verify**: `git status` shows the deletion; no code references it
(`grep -rn "config/test" app lib` → 0).

### Step 4: Remove `getPaymentStatus` (only if Plan 004 landed)

Delete lines 86-129 of `lib/sheets.ts` (the `getPaymentStatus` block including
its comment). Keep `getSessionDates` and `getGoogleAccessToken` untouched.

**Verify**: `grep -rn "getPaymentStatus" app lib docs --include=*.ts*` → 0
matches in code (docs mentions are fine); `npx tsc --noEmit` → exit 0

### Step 5: Fix the lint toolchain

In `package.json`: change `"lint": "next lint"` to `"lint": "eslint ."`, add
`"typecheck": "tsc --noEmit"`, and bump `"eslint-config-next"` to `"16.1.6"`
(match the installed `next` version). Run `npm install`.

**Verify**: `npm run typecheck` → exit 0; `npm run lint` → runs ESLint (exit 0,
or exits non-zero listing findings — if findings exist, fix ONLY unambiguous
mechanical ones (unused imports); if more than ~20 errors surface, STOP and
report the counts by rule instead of editing).

### Step 6: Full build

**Verify**: `npm run build` → exit 0

## Test plan

No test framework. Gates above. Manual smoke: `/governance` still renders
(PersonCard/Avatar intact); `/pickup/draft` still exports images
(html2canvas untouched).

## Done criteria

- [ ] `app/_dev/` and `app/dev-preview/` do not exist
- [ ] Drawer/Skeleton/Table/SegmentedControl deleted; Avatar and PersonCard intact
- [ ] `config/test` deleted
- [ ] `npm run lint` executes ESLint (not `next lint`); `npm run typecheck` exits 0
- [ ] `npm run build` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any pre-deletion grep returns unexpected importers → STOP for that file,
  delete only what re-verifies as dead.
- `eslint-config-next@16.1.6` does not exist on the registry → use the latest
  16.x and note it.
- The lint run surfaces >20 errors → report by rule, don't mass-edit.

## Maintenance notes

- Accepted debt recorded here: dual chart libraries (recharts in
  `app/league/mvp|stats`, chart.js in `app/pickup/**`) — revisit only if
  bundle size becomes a real complaint.
- If a future page needs a Drawer/Table/etc., restore from git history
  (`git log --diff-filter=D --name-only`) rather than rewriting.
- CI (when added) should run `npm run typecheck && npm run lint && npm run build`.
