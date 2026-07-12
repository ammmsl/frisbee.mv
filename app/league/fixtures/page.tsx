import {
  getActiveSeason,
  getAllFixtures,
  getTeamNames,
  getHolidays,
} from '@/lib/league-queries'
import PublicNav from '../_components/PublicNav'
import FixturesCalendar from './FixturesCalendar'

export const dynamic = 'force-dynamic'

// ─── Block derivation ─────────────────────────────────────────────────────────

type Block = 'Block 1' | 'Block 2' | 'Block 3'

function getBlock(mw: number): Block {
  if (mw <= 5) return 'Block 1'
  if (mw <= 8) return 'Block 2'
  return 'Block 3'
}

const MW_NOTES: Record<number, string> = {
  1: 'Post-Ramadan Launch',
  2: '7-Day Rest',
  3: '7-Day Rest',
  4: '7-Day Rest',
  5: '7-Day Rest',
  6: '14-Day Gap (Post-Holiday)',
  7: '7-Day Rest',
  8: '4-Day Rest (Pre-Eid Push)',
  9: '17-Day Gap (Post-Eid)',
  10: 'Season Finale',
}

// ─── Date helpers ──────────────────────────────────────────────────────────────

/** UTC ISO → DD/MM/YYYY in Maldives Time (MVT, UTC+5) */
function toMVTDateString(iso: string): string {
  const d = new Date(iso)
  const day   = d.toLocaleDateString('en-GB', { timeZone: 'Indian/Maldives', day:   '2-digit' })
  const month = d.toLocaleDateString('en-GB', { timeZone: 'Indian/Maldives', month: '2-digit' })
  const year  = d.toLocaleDateString('en-GB', { timeZone: 'Indian/Maldives', year:  'numeric' })
  return `${day}/${month}/${year}`
}

/** UTC ISO → weekday name in MVT */
function toMVTWeekday(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    weekday: 'long',
  })
}

// ─── Types exported for the client component ──────────────────────────────────

export type EnrichedFixture = {
  match_id: string
  matchweek: number
  block: Block
  kickoff_time: string
  date: string       // DD/MM/YYYY in MVT
  day: string        // 'Friday' | 'Tuesday' etc.
  home_team_id: string
  home_team_name: string
  away_team_id: string
  away_team_name: string
  bye_team: string
  note: string
  status: string
  score_home: number | null
  score_away: number | null
}

export type HolidayRow = {
  start_date: string  // YYYY-MM-DD
  end_date: string    // YYYY-MM-DD
  name: string
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FixturesPage() {
  let season = null
  try { season = await getActiveSeason() } catch {}
  if (!season) {
    return (
      <div className="page-shell">
        <PublicNav />
        <div className="page-container text-gray-400">No active season.</div>
      </div>
    )
  }

  const data = await Promise.all([
    getAllFixtures(season.season_id as string),
    getTeamNames(season.season_id as string),
    getHolidays(season.season_id as string),
  ]).catch(() => null)

  if (!data) {
    return (
      <div className="page-shell">
        <PublicNav />
        <div className="page-container text-gray-400">No active season.</div>
      </div>
    )
  }

  const [rawFixtures, teamNames, rawHolidays] = data

  // Compute bye team per (matchweek, date) — the team absent from both fixtures that day
  // Group fixtures by matchweek to identify which teams are playing
  const mwTeams = new Map<number, Set<string>>()
  for (const f of rawFixtures) {
    const mw = Number(f.matchweek)
    if (!mwTeams.has(mw)) mwTeams.set(mw, new Set())
    mwTeams.get(mw)!.add(f.home_team_name as string)
    mwTeams.get(mw)!.add(f.away_team_name as string)
  }

  const enrichedFixtures: EnrichedFixture[] = rawFixtures.map((f) => {
    const mw = Number(f.matchweek)
    const playing = mwTeams.get(mw) ?? new Set<string>()
    const bye = teamNames.find((t) => !playing.has(t)) ?? ''
    return {
      match_id:       f.match_id as string,
      matchweek:      mw,
      block:          getBlock(mw),
      kickoff_time:   f.kickoff_time as string,
      date:           toMVTDateString(f.kickoff_time as string),
      day:            toMVTWeekday(f.kickoff_time as string),
      home_team_id:   f.home_team_id as string,
      home_team_name: f.home_team_name as string,
      away_team_id:   f.away_team_id as string,
      away_team_name: f.away_team_name as string,
      bye_team:       bye,
      note:           MW_NOTES[mw] ?? '',
      status:         f.status as string,
      score_home:     f.score_home != null ? Number(f.score_home) : null,
      score_away:     f.score_away != null ? Number(f.score_away) : null,
    }
  })

  const holidays: HolidayRow[] = rawHolidays.map((h) => ({
    start_date: h.start_date as string,
    end_date:   h.end_date as string,
    name:       h.name as string,
  }))

  return (
    <div className="page-shell">
      <PublicNav />
      <FixturesCalendar
        fixtures={enrichedFixtures}
        teams={teamNames}
        holidays={holidays}
      />
    </div>
  )
}
