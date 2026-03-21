-- news-seed.sql
-- Paste this into the Supabase SQL editor to seed news_posts from historical events.
-- Dollar-quoting ($$...$$) avoids escaping issues with apostrophes in body text.
-- published_at is set ~1 week before each event date, at 12:00 MVT (UTC+05).
-- Run: SELECT slug, title, published_at FROM news_posts ORDER BY published_at;
--      to verify after import.

INSERT INTO news_posts (slug, title, summary, body, author, published_at, cover_image_url)
VALUES

-- 1. UFA 5v5 Tournament 2025 (Jan 24, 2025)
(
  $$ufa-5v5-tournament-2025$$,
  $$UFA 5v5 Tournament 2025$$,
  $$The first official UFA tournament — seven teams compete across group-stage play and knockout matches at Vilimale Football Grounds.$$,
  $$## Overview

The UFA 5v5 Tournament was the first official event of the Ultimate Frisbee Association — Maldives. Seven teams competed in a dual-group round-robin followed by knockout semifinals and a championship final.

## Event Details

- **Date:** 24 January 2025
- **Time:** 19:00 – 23:00 MVT
- **Location:** Vilimale Football Grounds, Malé

## Format

The tournament used a dual-group round-robin for the preliminary stage. The top two teams from each group advanced to cross-pool semifinals (Group A #1 vs Group B #2, and Group B #1 vs Group A #2), with the winners meeting in the final.

Group stage matches were played to a **7-point cap** with a **20-minute hard cap**. The final featured an **11-point cap**, a **30-minute hard cap**, and a universe point if the score was tied at time.

All matches were self-officiated under Spirit of the Game (SOTG) principles.

## Prizes

Champion medals and a breakfast from SpiceHut.$$,
  'UFA',
  '2025-01-17 12:00:00+05',
  NULL
),

-- 2. Training Clinic with Mark Pedroza (Apr 18–20, 2025)
(
  $$mark-pedroza-training-clinic-2025$$,
  $$Training Clinic with Mark Pedroza$$,
  $$UFA hosts an intensive two-day clinic with USA Ultimate Certified coach Mark Pedroza, covering advanced throwing, strategy, and gameplay — followed by a hat tournament.$$,
  $$## Overview

The Ultimate Frisbee Association hosted a two-day training clinic featuring USA Ultimate Certified coach **Mark Pedroza** — an internationally experienced coach and founder of Ultimate Malaysia. The clinic covered advanced throwing mechanics, team strategy, and gameplay, followed by a hat tournament on the final day.

## Schedule

- **Pre-clinic:** Online X's and O's strategy session (11–12 April, tentative)
- **Training:** Friday 18 April – Saturday 19 April 2025
  - Morning sessions: 08:00 – 11:00 MVT
  - Evening sessions: 20:00 – 23:00 MVT
- **Hat Tournament:** Sunday 20 April 2025, 20:00 MVT

## Session Content

| Session | Focus |
|---|---|
| Day 1 Morning | Throwing mechanics (backhand, forehand, hammer), cutting, field awareness |
| Day 1 Evening | Horizontal Stack — formation, cutting patterns, defensive strategy |
| Day 2 Morning | Zone Defence and Offence — cup formations, breaking zones |
| Day 2 Evening | Vertical Stack — setup, cutting lanes, reset systems |
| Day 3 | Hat Tournament — application of learned techniques |

## Fees

| Participant | Fee |
|---|---|
| UFA Members | USD 30 |
| Non-members | USD 50 |

Participant limit: 30.

## About the Coach

Mark Pedroza is a USA Ultimate Certified coach (Foundational Coach, Tournament Director, Youth Certification) and General Manager at Global Sports Partners. He has run training programmes across Southeast Asia and combines educational leadership principles with athletic development.$$,
  'UFA',
  '2025-04-11 12:00:00+05',
  NULL
),

-- 3. Lights Out Hat Tournament (Jun 24, 2025)
(
  $$lights-out-hat-tournament-2025$$,
  $$Lights Out Hat Tournament$$,
  $$UFA's glow-in-the-dark hat tournament — sign up individually, get sorted into random teams on the night, and play under the lights.$$,
  $$## Overview

Lights Out is a glow-in-the-dark hat tournament — UFA's June 2025 social event. Players signed up individually and were sorted into randomly-formed teams on the night. Think neon, LED, and all things that light up the dark.

A hat tournament is a format where players' names are drawn at random to form teams, keeping the event social, inclusive, and fun first.

## Event Details

- **Date:** 24 June 2025 (Tuesday)
- **Time:** 20:00 MVT
- **Location:** Villingili Football Pitch, Malé
- **Player cap:** 36

## Format

Four teams were formed at random at the start of the evening — **Electric Lime, Polar Glow, Firefly, and Neon Tide** — each with 7–9 players. The tournament followed a **league format**: every team played every other team once, with 20-minute matches. There were no knockout rounds — final standings were determined by points (Win 3 / Draw 1 / Loss 0).

## Fees

- **UFA Members:** Free
- **Non-members:** MVR 30

## Player Seeding

Hat tournaments are used to collect player stats — participation, wins, goals, assists, blocks, and spirit points — which feed into year-end individual rankings and awards.$$,
  'UFA',
  '2025-06-17 12:00:00+05',
  NULL
),

-- 4. UFA 6v6 Disc Wars 2025 (Oct 17–18, 2025)
(
  $$ufa-6v6-disc-wars-2025$$,
  $$UFA 6v6 Disc Wars 2025$$,
  $$UFA's flagship team tournament — two evenings of competitive Ultimate at Vilimale Football Grounds, with teams competing for medals, bragging rights, and a cash prize.$$,
  $$## Overview

UFA 6v6 Disc Wars is the association's flagship team tournament. Teams of 6–8 players competed across two evenings at Vilimale Football Grounds for champion medals, bragging rights, and a cash prize.

## Event Details

- **Dates:** 17–18 October 2025
- **Time:** 19:00 – 23:00 MVT each day
- **Location:** Vilimale Football Grounds, Malé

## Team Format

Teams self-assembled with 6–8 players. Each team was required to include:
- A minimum of **one female player**
- A minimum of **one new or returning player**
- A maximum of **8 points** from an experience-balancing restricted players list

## Tournament Structure

The tournament used a **dual-group round-robin** in the preliminary stage, with the top two teams from each group advancing to cross-pool semifinals and a championship final.

- Group matches and semis: **7-point cap**, **20-minute hard cap**
- Final: **11-point cap**, **30-minute hard cap**, universe point if tied at time

Group stage matches and semis were self-officiated under SOTG principles. The final featured observers for line calls, scoring, and rule clarifications.

## Fees

- **UFA Members:** MVR 35 per player
- **Non-members:** MVR 45 per player$$,
  'UFA',
  '2025-10-10 12:00:00+05',
  NULL
),

-- 5. Maahefun Frisbee 2026 (Feb 10, 2026)
(
  $$maahefun-frisbee-2026$$,
  $$Maahefun Frisbee 2026$$,
  $$A Ramadan commemorative frisbee evening — teams drawn from sign-ups, followed by a community potluck of traditional Maahefun dishes.$$,
  $$## Overview

Maahefun Frisbee is UFA's Ramadan commemorative match — a social evening of Ultimate Frisbee followed by a community potluck. Teams were drawn randomly from individual sign-ups, with a playful twist: team formation was based on players' rankings of traditional Maahefun dishes.

Bring your favourite Maahefun food to share with everyone after the matches!

## Event Details

- **Date:** 10 February 2026 (Tuesday)
- **Time:** 20:00 MVT
- **Location:** Villingili Football Pitch, Malé
- **Player cap:** 48

## Format

2 or 4 teams were formed depending on final sign-ups, each with 7–12 players. Teams were drawn at random, balanced to ensure at least one handler and one female player per team where possible.

Each team played a minimum of one 20-minute match. The final match was decided by a **universe point** if the score was tied at time.

## Fees

- **UFA Members:** Free
- **Non-members:** MVR 35 (covers event and field booking)

Open to both members and non-members.$$,
  'UFA',
  '2026-02-03 12:00:00+05',
  NULL
);
