# UFA Data Publication Spec v1.0

**For:** the frisbee.mv "data section" build.
**Source of truth:** the UFA Analysis repo (`C:\Users\amsal\Documents\Projects\UFA Analysis`,
branch `analysis/rebuild`) — 58 vetted report pages in `analysis/reports/`, `ASSUMPTIONS.md`,
`corrections.py`. This spec is the committed handoff; it folds together the wayfinder tickets
T01–T12 so a frisbee.mv session can build the section without re-reading the analysis repo.
**Committed:** 2026-07-12 (wayfinder T10 — the map's destination).

> **Filename note:** the T10 ticket named this `ufa-data-publication-spec-v1.0.md`; committed as
> `frisbee-mv-ufa-data-publication-spec-v1.0.md` to match this repo's docs convention
> (`frisbee-mv-<topic>-v1.0.md`).

---

## 0. The one-paragraph brief

The frisbee.mv site was written from memory and has ~18 factual conflicts with the analysis
evidence (§6). The data section fixes that and adds a curated, evidence-backed story surface.
Its shape is **narrative posts as the front door into a curated archive of vetted report pages**
(§4). Posts may cite only the **57 cleared findings** (§3), never the rejected/sensitive ones
(§3.3). Seven posts are prioritized (§5); two are drafted in full here to set the voice (§7).
Build the section in this repo *after* this spec — that work is out of the analysis map's scope.

---

## 1. Provenance & the privacy line (non-negotiable)

Every figure is tiered. The site may publish **PUBLIC** and **INTERNAL-aggregate**; it may never
publish **OWNER-CODED** or **RESTRICTED**.

| Tier | Meaning | Publishable? |
|---|---|---|
| **PUBLIC** | External literature, census, WFDF docs, published correspondence | ✅ |
| **INTERNAL-aggregate** | Computed from `ufa.sqlite` / chat / admin archive as de-identified aggregates (roles-not-names, opaque ids, category totals) | ✅ |
| **OWNER-CODED** | The owner-coding worksheet (nationality, visitor tags, occupation, schedule autonomy, introducer, kin ties) — decision-grade | ❌ Never. May shape *interpretation caveats only*, worded with **no number** |
| **RESTRICTED** | Member register, bank statements, NIDs, payment images | ❌ Never read; nothing derives from it |

Two hard sensitivity rules on top of the tiers:

- **Role = person.** In a ~56-member club a committee role identifies an individual. Role-tied
  load figures (Treasurer concentration, President's admin share, per-office bus-factor) stay
  internal even though they are INTERNAL-aggregate by tier. Publish the *aggregate* volunteer-capacity
  story instead (finding 9.x), never the per-office multiple.
- **Individual money stays internal.** Collection mechanics, credit limits, the never-settled
  "ghost" pattern, per-household cash routing — all internal.

---

## 2. Triage verdicts (T04) — what governs this spec

66 backlog rows were triaged and owner-confirmed (2026-07-12): **10 gating · 22 future-work ·
23 internal · 11 drop.** The gating fixes are all now applied (§ below). Standing provenance calls:

- **Membership-form demographic aggregates** (median birth year 1995, ~88/12 local–foreign) are
  **INTERNAL-aggregate and citable** — but the underlying data isn't in `ufa.sqlite` yet, so no
  demographics post is in the launch set (it joins later if the Tier-1 entry lands).
- **Founders-chat quotes:** paraphrase only, generic attribution ("early organisers…"), no named
  speakers, no verbatim.
- **Role-tied Treasurer/President findings:** rejected — role-stripped aggregates only.

Full detail: `UFA Analysis/wayfinder/assets/T04-confirmed-verdicts.md`.

### Gating fixes applied (T12, 2026-07-12) — reflected in the figures below
1. Sponsor names scrubbed from the archive pages (a-tb1, b3, oms-7) → generic "sponsorship".
2. Owner-coding instrument documented internally (visitor-tag definition, introducer validation).
3. Visitor-limitation caveat added to the retention pages as an interpretation note (no number).
4. **Volunteer comparator dropped** — the "England 2.7:1" benchmark is unsourceable, so finding 9.1
   now states UFA's **8.5:1 alone** with a note on why no national ratio is cited.
5. **WFDF Census confirmed filed** (owner) — WFDF readiness upgraded **5/7 → 6/7 met**.

---

## 3. The publishable findings catalogue (the citable whitelist)

**57 cleared findings across 11 themes.** Posts may cite these and only these. Each keeps its
denominator/freshness wording. Figures below are final (post T05/T06/T07/T12). Full catalogue with
method notes: `UFA Analysis/wayfinder/assets/T01-publishable-findings-catalogue.md`.

### 3.1 Freshness resolutions baked into these figures
- **Counts are current** (T05 nickname-overlay fold was a verified no-op): 350 people / 172 roster /
  150 played-never-rostered / 28 chat-only; no-show 16.2% / 9.2%.
- **One-and-done has two denominators, both correct, NEVER on one page:** **~50% of ALL newcomers**
  (PB-C2, incl. roster converts) vs **~81–87% of newcomers who never joined the roster**
  (SOC-4/CB-A; headline 130/150 = 87%). Any quote names its denominator.
- **Introducer/recruitment:** coverage 122/150 traced (82 strong); periphery recruitment is
  **peer-distributed, not official** — committee holds 2 of 82 strong attributions.

### 3.2 The whitelist

| # | Claim | Key figure | Source page | Tier |
|---|---|---|---|---|
| **1 · Origin & lifecycle** ||||
| 1.1 | WhatsApp pickup → registered association with committee + WFDF membership | 7 milestones 2018→2026; committee+membership 2025 | tb-4 | INT+PUBLIC |
| 1.2 | Seven years informal before formalising — a normal arc | 2018 founded · 56 members · lifecycle stage 3/5 | b-tb2 | INT (comparators approximate) |
| 1.3 | Six years pickup → WFDF recognition | 2018 → Provisional NF Feb 2025 | x-1, sm-6 | PUBLIC |
| 1.4 | Tracked record starts Jan 2024; 2018–23 was untracked FAM-turf pickup | 244 tracked sessions Jan 2024→Jun 2026 | oms-1, oms-5 | INT |
| **2 · Size & Dunbar structure** ||||
| 2.1 | ~350 people reached, ~172 became regulars | 350 ever · 172 roster · 150 played-never-rostered · 322 reached | oms-5 | INT |
| 2.2 | Reproduces Dunbar layers: ~15 weekly, ~50 monthly, ~204 yearly | 15/50/204 (analyst-set cuts) | pb-c1, pb-x1 | INT |
| 2.3 | A tiny core carries the club | 22 people = 50% of attendance; top decile 64% | pb-c1 | INT |
| 2.4 | Sessions big and reliable | median 22 (11–41), n=215; 1/215 below quorum | pb-s1 | INT |
| 2.5 | Cancellations rare | 4 in ~2.5 yr (~1.6%) — 2 quorum, 2 venue | pb-s1 | INT (chat-classified; future re-verify) |
| 2.6 | Women above Kanter's tokenism threshold | 35% women (threshold 30%); roster 112 M / 60 F | pb-c1, sm-5 | INT |
| **3 · RSVP reliability (Part B)** ||||
| 3.1 | First measured pickup no-show rates | any-point 16.2% · final-list 9.2% · walk-ons 12.6% (n=171) | pb-s2 | INT |
| 3.2 | No overbooking needed | median final ÷ headcount = 1.00× (lit. 1.5–2×) | pb-s2 | INT |
| 3.3 | Members far more reliable than non-members (selection, not price) | final-list no-show 4.4% vs 21.6% | pb-s2 | INT |
| 3.4 | Each cascade ignited by a small habitual early-commit core | 8/115 habitual early; early core honours 97% | pb-s2 | INT |
| 3.5 | 24 breakpoints benchmarked, 2 literature gaps filled | 24 breakpoints · 2+2 gaps | pb-x1 | INT+PUBLIC |
| **4 · Newcomers & the cliff** ||||
| 4.1 | Half of ALL newcomers play exactly once | ~50% (n≈307 incl. converts); parkrun 22% | pb-c2 | INT — always "of all newcomers" |
| 4.2 | Among never-joined periphery, ~4 in 5 came once | 81% (SOC-4) / 84% (CB-A); 130/150 = 87% played once | soc-4, cb-a | INT — always "never-joined periphery"; **never on the same page as 4.1** |
| 4.3 | Early habit predicts survival | ≥4 sessions in first 6 wk → 64% vs 24% 6-mo survival | pb-c2 | INT |
| 4.4 | Out-retains gyms at 12 months | 30% vs gym ~19% (directional) | pb-c2 | INT |
| 4.5 | Membership renewal strong | 72% renewal 2025→26 (37/51) + 19 new | pb-c2 | INT |
| 4.6 | Lapsed players mostly vanish, but a share boomerangs | 83% no trace · 17% → engager · 13% return after 6+ mo gap | pb-g1 | INT |
| 4.7 | A durable core emerges from the periphery | 23 of 150 never-rostered are durable core | cb-a | INT |
| **5 · Money (pickup slice + AGM totals only)** ||||
| 5.1 | Deliberate AGM-set patronage, not cost-recovery; 2026 cut halved the fee | 2025 MVR 700 → 2026 MVR 250 renewal / 350 new-joiner total; surcharge 10/25 | oms-6, oms-13 | INT — never "350 membership" flat |
| 5.2 | 2026 cut made from a surplus, not distress | 2025 income Rf 165,475 · expense Rf 145,909 · surplus Rf 19,566, debt-free | oms-13, agm-finance | INT |
| 5.3 | Field booking is a pass-through; pickup ~cost-neutral | field booking Rf 63,425 both sides | agm-finance | INT |
| 5.4 | Collection discipline high; defaults small and booked | 99.3% / 96.8% collected (2024/25); write-off ≈ Rf 1k | agm-finance | INT |
| 5.5 | 2026 fee pays for itself quickly | break-even 17 sessions (250) / 23 (350) vs 47 (2025) | oms-6 | INT |
| 5.6 | Money = pickup slice + AGM totals only (standing caveat) | scope statement | ASSUMPTIONS §4 | — publish as standing caveat |
| **6 · Venue** ||||
| 6.1 | Single-venue club, no contract — biggest structural exposure | 89% sessions / 92% attendance at Villingili; HHI 0.803; 0 contracts | b4 | INT + owner venue facts |
| 6.2 | Villingili scores as a genuine Oldenburg third place | index 0.79 vs mainland 0.50 | soc-5 | INT (proxy) |
| 6.3 | Second (HDC) venue bridges rather than splits | 31 HDC players, 97% also Villingili | nq-4 | INT |
| **7 · Network** ||||
| 7.1 | One integrated community — no admin-vs-play split | Leiden Q 0.241 below null 0.379 (z≈−9) | nq-2 | INT — never quote the old z=2.1 bug |
| 7.2 | Periphery is socially off the map | 142/150 are @-mention isolates | nq-5 | INT |
| 7.3 | Attention concentrates on committee | 50% inbound mentions → 22 of 136 nodes | oms-3/oms-14 | INT — aggregate share only, not per-role multiples |
| 7.4 | Informal standing tracks formal office | 7/10 most-mentioned are office-holders/founders | oms-15 | INT |
| 7.5 | Women's participation gap mostly a modelling artifact | NB rate ratio 0.771 (CI 0.579–1.028) | sm-5 | INT |
| **8 · Governance (direction, not measurement)** ||||
| 8.1 | Boardroom on paper, kitchen-table in practice | charter 1.2 vs practice 0.5 | tb-1, oms-16 | INT (rubric) |
| 8.2 | Widest policy→practice gap: national mandate vs Greater-Malé reality | 1 of ~20 atolls; 0 atoll sessions; 322 reached | b1, oms-5 | INT |
| 8.3 | Good-governance self-audit solid for size, with named gaps | 7/12; checks-&-balances the absent one | tb-3 | INT (rubric) |
| 8.4 | Financial controls Ministry-mandated + staged to NA status, by design | annual post-AGM submission; audit at NA | ASSUMPTIONS §8, oms-7, tb-3 | PUBLIC+INT — never the old "charter gap" framing |
| 8.5 | WFDF readiness: **6/7 met**, provisional held | 6 met · 1 partial (all disc games); **Census filed**; Provisional NF Feb 2025 | sm-6, oms-7 | PUBLIC + owner-confirmed |
| 8.6 | Developer of the sport more than a regulator | 71% of committee bandwidth to developer roles | b-tb1 | INT |
| 8.7 | Meets institutional demands by acquiescence/compromise, never defiance | 7 demands: 2 acquiesce, 5 compromise, 0 defy | b3 | INT (doc-coded) |
| 8.8 | Shared turf is a half-built commons | Ostrom 4/8 met, 11/16 | cb-b | INT (doc-coded) |
| 8.9 | SPLISS-lite: participation/competition/governance emerging; performance pillars are gaps | 10/27 | a-tb1 | INT (doc-coded) |
| 8.10 | Admin load per member falling as club grows | 0.265→0.214 actions/member | a-tb2 | INT |
| **9 · Volunteer capacity (the strain — aggregate only)** ||||
| 9.1 | The one clear structural strain: a thin volunteer layer | **8.5:1 players per admin volunteer** (no national benchmark cited — figures mix definitions, aren't club-level) | pb-g1, pb-x1 | INT |
| 9.2 | Admin far more concentrated than playing | Gini admin 0.948 vs play 0.669 | sm-2 | INT |
| 9.3 | Succession is the structural weak point | 9/9 offices have duties · 1/9 has a backup | oms-4 | INT (doc-coded) |
| **10 · Expansion** ||||
| 10.1 | A second community needs a measured funnel | 12→50→100 + 5-person core + venue | pb-e1 | INT (transplants Greater-Malé rates — say so) |
| 10.2 | Census-verified target populations exist | Greater Malé 212,138 · Addu 25,053 · Fuvahmulah 9,166 (2022) | pb-e1, DR docs | PUBLIC |
| 10.3 | League Season 1 ran below the team floor, still 60%-completed | 5→4 teams (floor 6–8) | pb-e1 | INT |
| **11 · Growth research (all PUBLIC)** ||||
| 11.1 | Adults stay for connection + caring coaching; the fix is a structured onramp | 18/25 verified claims | growth-brief | PUBLIC — keep both-denominator cliff phrasing verbatim |
| 11.2 | A copyable model: DiscNY 6-week coached beginner league, pay-what-you-can | ~US$30/60/90; free first trial | growth-substrate | PUBLIC |
| 11.3 | Youth programming recruits volunteers (esp. parents) | club structure > individual traits | growth-substrate | PUBLIC |
| 11.4 | WFDF seed funding is real but small and short-horizon | US$1,500 cap / 12–15 mo | growth-brief | PUBLIC |
| 11.5 | Maldivian age profile typical; missing the under-25 pipeline | WFDF 2025 median ≈30; USAU <10% aged 35+ | DR demographics ([3-0] claims) | PUBLIC |

### 3.3 NEVER publish (hard rules)
- **Standalone "~82% one-and-done"** with no denominator — superseded; 4.1 and 4.2 always travel
  with their denominators, never on the same page.
- **"NQ-2 significant structure z=2.1"** — a fixed bug; the truth is the null (7.1).
- **"Bonus nights = new 2026 format"** / anything from `session_type` — a DB artifact; venue is real.
- **"Founded 2019 / 10 players"** — a documented self-report error; cite only as a self-report conflict.
- **"2026 membership = 350"** flat — 350 is the new-joiner first-year total; membership is 250.
- **"Finance controls are a charter gap"** — replaced by 8.4 (staged-to-NA by design).
- **Role-tied load** (Treasurer/President concentration, per-office bus-factor), **individual money**
  (collection mechanics, credit caps, the ghost pattern), and **any owner-coded number** (the ~18%
  visitor stratum, nationality/occupation reads).

---

## 4. Section shape (T08) — Shape C, hybrid

Two coordinated surfaces:

1. **Posts (the front door).** Reuse the existing news/posts engine (DB markdown → `marked`, slugs,
   OG, share, admin CRUD) — a post is ~zero new infra. Tag/categorise posts as **Research** (confirm
   the news schema has a category/tag or add one small field). Posts cite only the §3 findings and
   carry their denominator/freshness wording.
2. **Archive (the depth).** The vetted report HTML served statically (e.g. `/public/data/*.html`)
   behind **one server-rendered curated index page**, also reached from each post's "read the full
   report" link. Reports self-carry their caveats; the site adds no editorial layer over them.

**Charts:** no new dependency. Occasional inline post figure = **Recharts** (already installed);
heavy visuals stay inside the linked archive report (self-contained d3, rides along in the file).

**Which report pages may ship in the archive** — the T11 page clearance (post-T12): **34
publish-as-is · 4 needs-redaction · 21 internal-only.** Full table:
`UFA Analysis/wayfinder/assets/T11-page-clearance-list.md`.

- **Publish-as-is (34):** the cleared-finding pages, incl. pb-c2/soc-4/cb-a (visitor caveat +
  two-denominator labels already on-page) and pb-g1/pb-x1/oms-7/sm-6 (cleared by the T12 fixes).
- **Needs-redaction (4) — do these strips before the page ships:**
  - **agm-finance** — strip the R2 collection-mechanics ("actively managed receivable", ~Rf 200/500
    soft caps) and the "Unpaid Losses / never-settled" ghost finding from BOTH Findings and Method;
    keep the income/expense/surplus/pass-through/collection-rate aggregates.
  - **nq-5** — strip the R4 deepest-shell k-core null (12-core / null 11.0 / z=1.66 tiles + finding);
    keep the off-graph-periphery headline (142/150).
  - **b-tb2** — its own maturity comparator table is unsourced `[ASSUMPTION]` general knowledge:
    keep with the caveat (consistent with the Theme-8 "direction, not measurement" frame) or soften.
    **Owner call before ship.**
  - **a-tb1** — verify the "GSP" coaching-partner acronym is an acceptable named counterparty (not
    yet decided). **Owner call before ship.**
- **Internal-only (21):** all R1 role-tied (tb-5, b5, oms-3, oms-14, oms-2, oms-12, tb-2), R2 (soc-2),
  and R4 weak/null/exploratory pages (nq-3, cb-c, sm-3, nq-1, cb-d, soc-3, soc-1, b2, b6, oms-8/9/10/11)
  — never ship.

---

## 5. Post briefs (T09) — prioritized

Seven question-led flagship posts. Each weaves several §3 findings and links its archive report(s).
Publish order below is by *safe-and-broad first, careful-and-sensitive later*.

| # | Title | Angle | Key findings | Tier notes |
|---|---|---|---|---|
| 1 | **How big is UFA, really?** | Bigger and more layered than it looks; a tiny core carries it; it's *one* community | 2.1, 2.2, 2.3, 2.6, 7.1 | INT. Safe opener. Never the z=2.1 bug. |
| 2 | **Do people actually show up?** | First measured pickup no-show rates; members more reliable; a habitual core ignites each game | 3.1–3.4 | INT. Novel, safe. |
| 3 | **From WhatsApp to WFDF** | Seven years informal → recognised association — a normal arc | 1.1–1.4, 8.5 (6/7) | PUBLIC+INT. "Since 2018" = tracked era; founding-2019 only as a self-report conflict. |
| 4 | **One field, no contract** | Single-venue exposure; but a genuine third place; the second venue bridges | 6.1–6.3 | INT + owner venue facts. |
| 5 | **What it costs — and why we cut the fee** | Deliberate patronage, not cost-recovery; cut from surplus; **cost is not the retention barrier** (hands to #6) | 5.1, 5.2, 5.5 | INT. Never "350 membership". Standing money caveat (5.6). |
| 6 | **Half of all newcomers play once** | The front-door cliff; early habit predicts survival; the real friction to a second visit is **access, not money** (the ferry to Villingili); the fix is a structured onramp | 4.1, 4.3, 4.4 + 11.1, 11.2 | INT + PUBLIC. **Cite the ~50%-of-all-newcomers denominator ONLY; never the 81–87%. Access/autonomy framing = organiser interpretation, no owner-coded number.** |
| 7 | **What the research says about growing the sport** | External literature on adult-sport growth; a copyable model; a measured funnel for a second community | 11.1–11.5, 10.1–10.3 | PUBLIC (10.1/10.3 INT). Keep the funnel's rate-transplant caveat. |

**Held back from launch** (later wave): Theme 8 governance (inside-baseball), Theme 9 volunteer
squeeze (sensitive-adjacent), periphery 7.2/7.3 — the natural home of the 81–87% figure, which
stays out of the post layer entirely.

Full briefs: `UFA Analysis/wayfinder/assets/T09-post-list-and-samples.md`.

---

## 6. Site amendment list (T02)

The current site (written from memory) has **18 conflicts** with the evidence. Fix these as part of
the data-section work (or as a prior pass). 14 claims verified correct, 9 unverifiable (owner to
confirm). Full detail with file:line refs:
`UFA Analysis/wayfinder/assets/T02-site-amendment-list.md`.

| # | Claim | Current site | Correct |
|---|---|---|---|
| A1 | Player count | "167+" | Label the denominator: **172** roster · **~322** ever-played · **350** ever-engaged |
| A2 | Attendances | "3,481+" (stale, Oct 2025) | **4,906** as of 2026-06-26 |
| A3 | "113 consecutive weeks without interruption" | false | Not unbroken (Ramadan gap, a zero-session week, 4 cancellations) — say **"244 tracked sessions"** |
| A4 | Founding year | "Founded 2024" | **Founded 28 Sep 2018**, registered 3 Sep 2024 |
| A5 | Registration date | "2 Sep 2024" | **3 Sep 2024** (COS 141-COS-A/CERT/2024/7) |
| A6 | WFDF provisional | "Dec 2024" | **Feb 2025** (Dec 2024 ≈ application) |
| A7 | Villingili start | "Jan 2024" | Jan 2024 = FAM/Hulhumalé; **Villingili from 2 Feb 2024** |
| A8 | First tournament | "49 players" | **42 players** (31 M/11 F), 7 teams, 24 Jan 2025 |
| A9 | Disc Wars | "7v7, 72 players" | **6v6, 64 players**, 8 teams, 17–18 Oct 2025 |
| A10 | Committee term | "four-year / 2024–2028" | **5-year** term (AoA) → 2024–2029 |
| A11 | Membership fee | "MVR 200" | **250** renewing / **350** new (year one); no era had 200 |
| A12 | Session time | "5:30 PM" | **8:00 PM (20:00 MVT)** |
| A13 | Fuvahmulah/Addu sessions | "regular / occasional sessions" | **Zero** atoll sessions; **one event each** (Eid Ufaa Fuvahmulah 2025-04-01; Addu intro 2025-11-25). Say "event & outreach activity", not sessions |
| A14 | Placeholder news "registered Dec 2024" | Dec 2024 | Registration **3 Sep 2024** |
| A15 | Placeholder news "Season 1 … 113 weeks, Jan 2025" | impossible | League **Season 1 = Feb 2026**; arithmetic impossible |
| A16 | Docs spec "March 2024 founded" | March 2024 | No such event; founded 2018, registered 2024 |
| A17 | "Registered as a **national** sports association" | national | Registered as **a sports association**; NA status not yet earned |
| A18 | MFDF name "only due to US trademark" | trademark-only | **Deliberate all-disc-sports mandate design**; trademark not the sole/documented reason |

**Standing rule for the site:** label every people-count with its denominator, and standardise on
DB-derived numbers (the self-report figures drift — 100+/200+/250+ players, 40+/50+/60 members).

**Before launch, replace placeholders** (self-declared): `config/committees.json` mandates,
`config/board.json` bios, `config/sponsors.json` entries.

---

## 7. Sample post drafts (voice-setters)

Two drafts set the voice for the remaining five briefs: **#1** (the default register) and **#6**
(the hardest framing — denominator discipline + organiser-interpretation restraint). Written in
full so the rest interpolate between a worked easy and a worked hard example. Tone: plain, precise,
honest about limits, warm about the community; no hype, no unearned superlatives.

---

### Draft — Post #1: "How big is UFA, really?"

*Category: Research · links to: the community-size report (oms-5), the Dunbar/core report (pb-c1),
the network report (nq-2)*

Ask how big UFA is and you'll get a different number depending on what you count — which is exactly
why it's worth doing carefully.

Roughly **350 people** have touched the club in the tracked era: turned up to play, or joined the
chat and followed along. Of those, about **172 became regulars** — people with a real playing
record — and another 150 played at least once without ever settling in. Put the players together and
UFA has **reached around 322 people** on the field. None of these is "the" number; each answers a
different question, so we label them rather than pick a headline.

What's striking isn't the total — it's the shape. Without anyone planning it, the club has arranged
itself into the layers the social-science literature keeps finding in human groups: about **15 people
show up most weeks**, roughly **50 in a given month**, and around **204 across a year**. Those are
close to Dunbar's famous 15 / 50 / 150 bands — the sizes at which we naturally keep different grades
of relationship. A pickup game in Malé reproduced them without reading the book.

And a small core does the heavy lifting. **Twenty-two people account for half of all attendance**;
the top tenth of players account for nearly two-thirds. That's not a warning sign — every voluntary
community runs on a committed few — but it's worth seeing clearly, because a club that depends on 22
people is a club that should look after them.

Two more things the numbers settle. **About 35% of gendered players are women** — above the 30%
threshold at which, in the research on group dynamics, a minority stops being tokenised and starts
being normal. And when we mapped who talks to whom, UFA does *not* split into an "admins" clique and
a "players" clique: statistically, the club is **one integrated community**, with softer sub-groups
that are texture, not structure.

So: bigger than the roster, smaller than the chat, and — reassuringly — a single community with a
canonical human shape and a core that carries it. *(Every figure here is a de-identified aggregate
from the club's own records; read the full analysis in the linked reports.)*

---

### Draft — Post #6: "Half of all newcomers play once"

*Category: Research · links to: the newcomer-retention report (pb-c2), the growth-research brief*

Here's the number that should shape how UFA grows: **about half of all newcomers play exactly once.**

That's across everyone who has ever turned up in the tracked era — including the people who went on
to become paying members. (For comparison, parkrun, the gold standard of accessible community sport,
loses about 22% of its first-timers after one run.) So the front door is leaky, and it's worth
understanding why before spending effort on it.

The instinct is to blame cost. The evidence says otherwise — and so does anyone who runs the
sessions. The fee is small and pays for itself in about 17 turns up (see *What it costs*); it was
recently *cut*, from a surplus. The real hurdle to coming back a second time isn't money. It's
**getting there.** Villingili is an island; playing means a ferry and a committed block of your
evening. That's a cost in time and self-organisation, not rufiyaa — and it's a much bigger ask on
someone's second visit, before the habit exists to carry them over it. *(That reading is the
organisers' interpretation of why people don't return, not a measured statistic.)*

The good news is that the fix is well understood, and it isn't "run more open pickup." When the
newcomer habit *does* form early, it sticks hard: people who play **four or more times in their first
six weeks** are retained at **64% at six months, versus 24%** for those who start slower. And UFA is
actually *stickier* than commercial gyms once people are in — about **30% still playing at a year**,
against a gym benchmark near 19%. The problem is purely the front door, and the research on adult
sport is blunt about what helps: adults stay for **connection and good coaching**, not more drop-in
volume. A structured onramp — a short, coached beginner block that lowers the second-visit hurdle and
builds a starter group — is the lever. DiscNY's six-week coached beginner league is one copyable model.

So the headline isn't "half our newcomers quit." It's: **the game keeps the people who get over the
threshold — so lower the threshold.** *(All figures are de-identified aggregates from the club's
records; a portion of one-time players are short-stay visitors who were never going to convert, which
we account for internally — it doesn't move these rates.)*

---

## 8. Build notes & what's out of scope

- **Build in this repo, after this spec.** Adding the routes/components/DB rows for the data section
  happens in frisbee.mv sessions — it was deliberately out of the analysis map's scope.
- **Posts cite findings, the archive ships pages.** Keep the two clearance lists distinct: a finding
  can be cleared while its whole page is not (§4).
- **Owner calls still open** before specific things ship: b-tb2 maturity table (keep/soften), the
  a-tb1 "GSP" acronym, and the 9 unverifiable T02 claims (§6 refs C1–C9 in the asset).
- **Later additions if data lands:** an INTERNAL-aggregate demographics post (median birth year 1995,
  ~88/12 local–foreign) once the Tier-1 entry reaches `ufa.sqlite`; a governance/volunteer wave once
  the launch voice is proven.
- **Unresolved dependency to note, not resolve:** the cited "debt-free Rf 19.6k surplus / ~Rf 1k
  write-off" figures sit above an off-tracker bank↔pickup reconciliation (~Rf 31k pool) that stays
  RESTRICTED/owner-driven.
