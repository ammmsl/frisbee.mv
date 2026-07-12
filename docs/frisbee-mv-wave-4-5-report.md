# Wave 4 + 5 Report — Data Section & Per-Page Macros

**Branch:** `wave-4-5-data-and-macros`, branched off `wave-2-3-structure-and-chrome` at `530e08e`
(Wave 2+3 was not yet merged to main). **Pushed to origin at your mid-run request** so you can
test a Vercel preview — this deviates from the original NEVER-push instruction on your explicit
message; every pushed commit passed `tsc` + `build` first.
**Run:** overnight session, 2026-07-12 → 13.
**Verification:** `npx tsc --noEmit` and `npm run build` exited 0 after every package **and after
every Package-D page commit**, and on the final tree. `npm run lint` skipped (known-broken on
Next 16). Nothing was reverted; all packages and all seven pages shipped.

## Commits (oldest first)

| Commit | What |
|---|---|
| `7926988` | **A** — T04: `news_posts.category`, default-safe |
| `f28dc05` | **B** — T05 prototype: `/data` archive index |
| `96d6ed6` | **C** — T06: 36 report pages + redactions |
| `91bc2d4` | **D-3a** — home: Marquee Hero |
| `703003a` | **D-3b** — about: Long Document |
| `3dd9146` | **D-3c** — governance: Stat-Led |
| `856251d` | **D-3d** — play: Workbench |
| `31d5e57` | **D-3e** — contact: Letter |
| `6096bf7` | **D-3f** — sponsors: Quote-Led |
| `30b5b6a` | **D-3g** — pickup hub: Typographic List |
| `e457dca` | **E** — ADRs, CONTEXT.md, .hallmark/log.json, CLAUDE.md |
| *(this commit)* | Wrap-up: tickets, map, BUILD-PROGRESS, this report |

---

## ⚠ The one thing to look at first: two pages withheld on privacy grounds

A full-set privacy sweep (subagent, all 38 candidate pages, findings + tiles + captions + method
+ JSON blobs) found **oms-15** ("Does informal power match formal authority?") and **b-tb1**
("Is UFA a developer or a regulator?") carry **per-office centrality tables**:

> President — 70 inbound @-mentions — rank #5 of 136 — top 97% · Treasurer — 52 — #11 ·
> Vice-President — 34 — #15 · Secretary — 21 — #28 (tables, stat tiles AND the JSON data blobs)

That is role-tied load — the privacy line the map marks non-negotiable, and the same category
that made oms-3 internal-only. T11 classified both pages publish-as-is ("aggregate rank facts");
the sweep disagrees, and your instruction was to report suspicious material rather than ship it.
Since the branch is now live on a Vercel preview, under-shipping was the reversible direction.
**Your call:** to restore, copy the two files from `UFA Analysis/analysis/reports/` into
`public/data/` and re-add their two index entries in `app/(site)/data/page.tsx` (Network and
Governance groups).

Two borderline items **shipped with flags** (both explicitly de-identified on-page, both cleared
by T11 — worth an eyeball, not a blocker):

- **soc-4** publishes an introducer table with per-individual counts under opaque ids (n7 — 5,
  n40 — 5, …). The page states it is chat-derived PUBLIC proxy evidence, not owner-coding.
- **oms-6** contains "the league reconciliation surfaces exactly one **paid, zero-attendance
  patron**" — no name, no unusual amount, but it is one identifiable individual's behaviour.
  (pb-g1 reports the same phenomenon as an aggregate: "6 of 56".)

---

## Package A — T04: news Research category

- **`migrations/001-news-category.sql`** — the ALTER TABLE you must run manually in the Supabase
  SQL editor (there is no migration tooling):

  ```sql
  ALTER TABLE news_posts
    ADD COLUMN category text NOT NULL DEFAULT 'news'
    CHECK (category IN ('news', 'research'));
  ```

- **Default-safe before the migration**: all reads select
  `COALESCE(to_jsonb(news_posts) ->> 'category', 'news')` — valid SQL whether or not the column
  exists. Writes gate on a cached `information_schema` check that **re-checks until the column
  appears**, so no restart is needed after you run the SQL. Pre-migration, a post saved as
  "research" silently lands as news (by design — nothing 500s).
- All six touchpoints from the T04 asset: `NewsPost` type + 3 read queries (+ optional category
  filter arg on `getPublishedPosts`), admin POST insert, admin PATCH allowlist + validation,
  admin form `<select>`. The admin list page's own query also got the column.
- **NewsFilter's title-regex fake categories are gone** — tabs are now All / News / Research on
  the real field. The old three pseudo-categories (Announcements / Tournament Results /
  Federation Updates) no longer exist; posts are never mis-bucketed by title.
- Post detail page shows a **Research badge** (new Badge variant, accent-dark on white, 4.71:1 AA)
  only on research posts.

## Package B — T05 prototype (react to these defaults)

Built `/data` (`app/(site)/data/page.tsx`, inside the site chrome). **Defaults locked, pending
your reaction:**

1. Archive index at **`/data`**.
2. Reports as **static files** at `public/data/<slug>.html` (spec §4 confirmed).
3. Research posts surface **through the news list** via the category filter — no separate landing.
4. Post → report linking = a plain **"Read the full report →" markdown anchor** in post bodies.
5. Index shape: Curated Index — typographic list grouped by the spec §3 themes (Origin &
   lifecycle → Growth research), slug in mono + question-led title per row, provenance note up
   top, standing money caveat + contact link at the foot. No cards, no new dependencies, no new
   component abstractions.
6. **Not done (owner call):** a masthead/footer entry for `/data` — the chrome was frozen this
   wave, so the page is reachable by URL and (eventually) from Research posts.

## Package C — T06 transfer + redactions

**Count note:** your instruction said "copy ONLY the 34 publish-as-is pages (≤ 34)" but also
ordered the agm-finance/nq-5 redactions and the b-tb2/a-tb1 calls — those four are the
*needs-redaction* rows of T11, so the cleared set is 38 (34 + 2 redacted + 2 per T03).
**36 shipped** after the two privacy withholdings above. The 21 internal-only pages were never
copied (verified by filename sweep — zero present).

**Transfer mechanics** (the reports weren't fully self-contained):

- `analysis/lib/` assets (report.css, charts.js, d3 + Observable Plot vendor files) copied to
  `public/data/lib/`; every page's `../lib/` refs rewritten to `lib/`.
- Every footer "← all tasks → index.html" link rewritten to point at **`/data`** (the analysis
  repo's index.html is not cleared and does not ship).
- pb-e1's link to the unshipped `PB_DR_web_parameters.md` neutralized to plain text (one plain
  `<code>` mention of the path remains — text only, nothing to click).
- All inter-report links verified to target shipped pages only.

**Redaction log — exact strips:**

*agm-finance* (R2 collection-mechanics + ghost finding, from BOTH Findings and Method):

1. Findings `<li>` "**The receivable is actively managed, not drifting.** … year-end collection
   drive … pressing after ~3 sessions … soft per-person credit limits (~Rf 200 / ~Rf 500) …" —
   removed whole.
2. Findings `<li>` "**Defaults exist, but they are small, identifiable and explicitly booked** …
   'Unpaid Losses' tag (~Rf 1,000 in 2025) …" — removed whole.
3. Method: the sentences "The collection process is owner-confirmed: a year-end collection
   drive, plus soft per-person credit limits … booked as a small explicit write-off (~Rf 1k in
   2025) … matching to the rufiyaa." — removed.
   Kept: income/expense/surplus/pass-through tables and charts, collection-rate aggregates
   (99.3% / 96.8% / 75.9%-recency), the "Pickup write-offs & pending 6,578" category line.

*nq-5* (R4 deepest-shell k-core null):

1. Stat tiles "12-core · null max 11.0" and "z=1.66 / p=0.177" — the null halves removed (the
   12-core/22-nodes descriptive tile stays, the z tile is gone; 142/150 tile untouched).
2. The "Is the core real? Config-model null" slab + figure — removed, including its JS block
   (otherwise the script would throw on the missing `#null` node).
3. Finding #1's depth-vs-null sentence ("observed 12 vs null mean 11.0, z=1.66, p=0.177 …") —
   removed; the descriptive core + Borgatti–Everett r=0.404 sentence stays.
4. Method's null paragraph and the footer's "+ 400 nulls" — removed.
5. JSON blob keys `null_kmax_mean`, `null_kmax_p95`, `z_kmax`, `p_kmax`, `null_topsize_mean`,
   `B` — removed (greps of page source are clean, not just the rendered view).

*b-tb2* ships as-is with its `[ASSUMPTION]` caveat; *a-tb1* ships as-is with "GSP" named — both
per T03.

**Verification:** grep confirms every redacted string absent set-wide; internal-only filenames
absent; page count 36; sweep found no sponsor names, no personal names, number-free visitor
caveats on pb-c2/soc-4/cb-a.

## Package D — Wave 5: Hallmark Phase 3 macros (one commit per page)

Standing overrides honored everywhere: **no Fraunces / no display serif** (Inter weights carry
hierarchy where the plan says Fraunces); chrome untouched (SiteNav/SiteFooter/global tokens)
except deleting one orphaned token; every page carries the stamp comment
`/* Hallmark · macrostructure: <name> · theme: federation · paper: tinted-pacific · accent: pacific-blue */`
and was checked against the anti-pattern list.

- **3a Home — Marquee Hero.** The standalone centred "Next Session" section moved into the hero's
  right column (asymmetric `lg:grid-cols-[1fr_auto]`, white typographic block behind the tint
  overlay, 44px directions link). Stats bar is now a **typographic row with thin vertical rules**
  — new `bare` prop on StatTile drops the card chrome but keeps the IntersectionObserver counter;
  the row is still the **live labelled fetch** from Wave 1 (no hardcoded numbers) and still hides
  when the sheet is unreachable. About snippet left-aligned (anti-pattern: centred-everything).
  News keeps horizontal-scroll-on-mobile / 3-col at `lg:`. HeroCarousel and the LCP path
  untouched. Orphaned `--note-special` token deleted from globals.css (its only consumer was the
  old section; the special note now renders white italic in the hero).
- **3b About — Long Document.** Accent band gone; headline top-left; mission is the opening
  paragraph (own h2 deleted); chapters under hairline rules with prose indented (`lg:ml-36`);
  **Timeline flattened to a single-column spine at all breakpoints** — the desktop zigzag and its
  `MilestoneContent` helper deleted; Where We Play is an inline `<dl>`, not three cards.
- **3c Governance — Stat-Led.** Opens with **five anchored numerals** (board 4 → #board,
  committees 5 → #committees, AGM docs → #documents, 2018 → #governed, 2025 → #wfdf), each a
  44px link. Board grid: President spans 2 columns (new `className` pass-through on PersonCard).
  **Call made:** a Committees section was restored (the count needed a target and the config was
  imported-but-unused) as a **names-only list** — the config mandates are literal "Placeholder
  mandate…" text (spec §6 C8, owner-owed), so they are not rendered until real content lands.
- **3d Play — Workbench.** Next-session utility block top-left (date, 8:00 PM MVT, venue,
  Instagram CTA + directions); schedule table, what-to-bring, free-to-try, FAQ accordion,
  membership follow under hairline rules; ends with a **typographic close** linking /play/rules
  (prose link, not a CTA). **Bonus fix:** the membership button still had pre-rebrand orange
  hovers (`#e55a27` / `#cc4f22`) — now accent tokens.
- **3e Contact — Letter.** The form-left/info-right grid replaced by one `max-w-prose` letter:
  greeting, what-we-respond-to prose with email/Instagram folded inline, ContactForm embedded in
  the letter (leaf untouched), postal `<address>` right-aligned as the sign-off.
- **3f Sponsors — Quote-Led.** Sponsor entries render as pull-quotes (description as the quote,
  name as attribution, hairline rules between tiers). With zero active sponsors the section shows
  the plan's empty state: *"We're looking for our first title sponsor. Get in touch."* → /contact.
  **Deviation-adjacent call:** the plan predates the post-publish page rework — the current
  "Ways to Help" 3-column icon-card grid is a listed anti-pattern, so it became a stacked
  single-column list (all copy preserved, icon chips dropped); the redundant centred bottom CTA
  section was deleted (the empty-state link covers it).
- **3g Pickup hub — Typographic List.** The 2-col rounded-card grid is now a `<dl>` — name as
  `<dt>` semibold, description + "Open →" underline link as `<dd>`, hairline rules, no cards.

Hard rules verified per page: no `<form>`, no bare `<img>`, `'use client'` unchanged (all edits
were server components except the existing StatTile leaf), 44px targets on every interactive
element, muted text stays `#626d7b`.

## Package E — followups

`docs/adr/0001-league-as-distinct-visual-sub-product.md`,
`docs/adr/0002-per-page-macrostructure-rotation.md` (with the assignments table + rules for new
pages), `CONTEXT.md` at root (terminology, chrome archetype IDs, macro table, privacy line),
`.hallmark/log.json` (machine-readable picks; news/events/calendar listed as `unassigned`), and
CLAUDE.md's stale disc-orange design table replaced with a pointer section. All four record that
**the display serif was dropped by owner call — single-font Inter is the recorded reality.**

---

## What YOU need to do (manual steps)

1. **Run the migration** — paste `migrations/001-news-category.sql` into the Supabase SQL editor.
   No redeploy/restart needed; the code detects the column.
2. **React to the T05 defaults** (§Package B above) — especially whether `/data` gets a nav or
   footer entry.
3. **Rule on oms-15 + b-tb1** (top of this report) — ship or keep internal.
4. **Optional prunes:** soc-4's introducer table / oms-6's single-patron sentence if you share
   the sweep's caution.
5. Vercel preview should be building from `wave-4-5-data-and-macros` (pushed per your message;
   3 pushes: after B, after C, after D+E wrap).

## Manual / browser checks left for you

1. **/data** — index renders in the chrome, groups read sensibly, every row opens its report;
   reports pull their CSS and charts (d3/Plot render — check agm-finance income/expense bars and
   nq-5's network graph specifically, since I edited their HTML/JS by hand); footer "← all
   reports" returns to /data.
2. **agm-finance + nq-5 rendered pages** — confirm the redacted findings/tiles/figures are gone
   and nothing looks visually broken where they were.
3. **News** — All/News/Research tabs (everything shows under News until the migration + a
   research post exist); admin form's Category select; Research badge on a research post.
4. **Home** — hero right column next-session block legible over carousel images at 320/768/1440;
   stats row rules look right on mobile horizontal scroll; counter still animates.
5. **Macro pages eyeball** — /about (timeline spine), /governance (anchor links scroll to the
   right sections; President card spans 2 at ≥640px), /play (utility block + typographic close),
   /contact (letter + right-aligned address), /sponsors (empty state), /pickup (dl list). No
   horizontal scroll at 320px anywhere.
6. **Reduced-motion + keyboard pass** on the changed pages (global guard is untouched, but the
   home hero block is new).
7. Governance committees list: names only by design — confirm you're happy showing committee
   names before mandates are written.

## Out of scope, untouched (as instructed)

Plans 005/006/007 · the remaining 5 Research posts (owner voice; none seeded, none published) ·
credential rotation · `app/league/*` (zero changes) · dev showcases · the Hallmark re-audit ·
news/events/calendar macro rotation (not in the plan's 3a–3g; flagged in ADR 0002).
