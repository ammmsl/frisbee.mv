import { unstable_cache } from 'next/cache'
import sql from './league-db'
import { getStandings, getHistoricalStandings } from './league-standings'

// All league read queries live here (plan 002). Every export is wrapped in
// unstable_cache with the shared LEAGUE_CACHE options so tags/TTL are set in
// exactly one place. Pages never import lib/league-db directly.
// Cache keys: `key('x')` → ['league-x']. Never reuse a key for a new row shape —
// rename it instead (that collision is the Plan-001 bug).

// Not `as const`: unstable_cache wants a mutable string[] for tags
const LEAGUE_CACHE: { tags: string[]; revalidate: number } = { tags: ['league'], revalidate: 300 }
const key = (k: string) => ['league-' + k]

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ActiveSeason {
  season_id: string
  season_name: string
  status: string
}

// Canonical superset of the four pre-002 per-page variants. New key so no
// stale entry with a narrower shape can be served.
export const getActiveSeason = unstable_cache(
  async (): Promise<ActiveSeason | null> => {
    const rows = await sql`
      SELECT season_id::text, season_name, status
      FROM seasons
      WHERE status = 'active'
      LIMIT 1
    `
    return (rows[0] as ActiveSeason | undefined) ?? null
  },
  key('active-season-v2'),
  LEAGUE_CACHE
)

export const getCachedStandings = unstable_cache(
  getStandings,
  key('standings'),
  LEAGUE_CACHE
)

export const getCachedHistoricalStandings = unstable_cache(
  getHistoricalStandings,
  key('historical-standings'),
  LEAGUE_CACHE
)

// ─── League home ──────────────────────────────────────────────────────────────

export const getNextFixtures = unstable_cache(
  async (seasonId: string) => {
    const rows = await sql`
      SELECT
        f.match_id::text,
        f.kickoff_time,
        f.matchweek,
        ht.team_id::text AS home_team_id,
        ht.team_name AS home_team_name,
        at.team_id::text AS away_team_id,
        at.team_name AS away_team_name
      FROM fixtures f
      JOIN teams ht ON ht.team_id = f.home_team_id
      JOIN teams at ON at.team_id = f.away_team_id
      WHERE f.season_id = ${seasonId}
        AND f.status = 'scheduled'
        AND f.kickoff_time > NOW()
      ORDER BY f.kickoff_time ASC
      LIMIT 3
    `
    return rows
  },
  key('next-fixtures'),
  LEAGUE_CACHE
)

export const getLastResult = unstable_cache(
  async (seasonId: string) => {
    const rows = await sql`
      SELECT
        f.match_id::text,
        f.kickoff_time,
        f.matchweek,
        ht.team_id::text AS home_team_id,
        ht.team_name AS home_team_name,
        at.team_id::text AS away_team_id,
        at.team_name AS away_team_name,
        mr.score_home,
        mr.score_away
      FROM fixtures f
      JOIN teams ht ON ht.team_id = f.home_team_id
      JOIN teams at ON at.team_id = f.away_team_id
      JOIN match_results mr ON mr.match_id = f.match_id
      WHERE f.season_id = ${seasonId}
      ORDER BY f.kickoff_time DESC
      LIMIT 1
    `
    return rows[0] ?? null
  },
  key('last-result'),
  LEAGUE_CACHE
)

// ─── Standings ────────────────────────────────────────────────────────────────

// Returns Record (not Map) so unstable_cache can serialize it with JSON.stringify
export const getFormGuide = unstable_cache(
  async (seasonId: string): Promise<Record<string, ('W' | 'D' | 'L')[]>> => {
    const rows = await sql`
      SELECT
        team_id::text,
        result,
        kickoff_time
      FROM (
        SELECT
          f.home_team_id AS team_id,
          CASE WHEN mr.score_home > mr.score_away THEN 'W'
               WHEN mr.score_home = mr.score_away THEN 'D'
               ELSE 'L' END AS result,
          f.kickoff_time
        FROM fixtures f
        JOIN match_results mr ON mr.match_id = f.match_id
        WHERE f.season_id = ${seasonId}
        UNION ALL
        SELECT
          f.away_team_id AS team_id,
          CASE WHEN mr.score_away > mr.score_home THEN 'W'
               WHEN mr.score_away = mr.score_home THEN 'D'
               ELSE 'L' END AS result,
          f.kickoff_time
        FROM fixtures f
        JOIN match_results mr ON mr.match_id = f.match_id
        WHERE f.season_id = ${seasonId}
      ) sub
      ORDER BY team_id, kickoff_time DESC
    `

    const result: Record<string, ('W' | 'D' | 'L')[]> = {}
    for (const row of rows) {
      const tid = row.team_id as string
      if (!result[tid]) result[tid] = []
      if (result[tid].length < 5) result[tid].push(row.result as 'W' | 'D' | 'L')
    }
    for (const tid of Object.keys(result)) {
      result[tid] = result[tid].reverse()
    }
    return result
  },
  key('form-guide'),
  LEAGUE_CACHE
)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

export const getAllFixtures = unstable_cache(
  async (seasonId: string) => sql`
    SELECT
      f.match_id::text,
      f.matchweek,
      f.kickoff_time,
      f.status,
      ht.team_id::text AS home_team_id,
      ht.team_name AS home_team_name,
      at.team_id::text AS away_team_id,
      at.team_name AS away_team_name,
      mr.score_home,
      mr.score_away
    FROM fixtures f
    JOIN teams ht ON ht.team_id = f.home_team_id
    JOIN teams at ON at.team_id = f.away_team_id
    LEFT JOIN match_results mr ON mr.match_id = f.match_id
    WHERE f.season_id = ${seasonId}
    ORDER BY f.kickoff_time ASC
  `,
  key('all-fixtures'),
  LEAGUE_CACHE
)

export const getTeamNames = unstable_cache(
  async (seasonId: string): Promise<string[]> => {
    const rows = await sql`
      SELECT team_name FROM teams
      WHERE season_id = ${seasonId}
      ORDER BY team_name ASC
    `
    return rows.map((r) => r.team_name as string)
  },
  key('team-names'),
  LEAGUE_CACHE
)

export const getHolidays = unstable_cache(
  async (seasonId: string) => sql`
    SELECT
      start_date::text,
      end_date::text,
      name
    FROM season_holidays
    WHERE season_id = ${seasonId}
    ORDER BY start_date ASC
  `,
  key('holidays'),
  LEAGUE_CACHE
)

// ─── Teams index ──────────────────────────────────────────────────────────────

export const getTeamsWithStats = unstable_cache(
  async (seasonId: string) => {
    const rows = await sql`
      WITH results AS (
        SELECT
          f.home_team_id AS team_id,
          CASE WHEN mr.score_home > mr.score_away THEN 3
               WHEN mr.score_home = mr.score_away THEN 1
               ELSE 0 END AS pts,
          CASE WHEN mr.score_home > mr.score_away THEN 1 ELSE 0 END AS won,
          CASE WHEN mr.score_home = mr.score_away THEN 1 ELSE 0 END AS drawn,
          CASE WHEN mr.score_home < mr.score_away THEN 1 ELSE 0 END AS lost
        FROM fixtures f
        JOIN match_results mr ON mr.match_id = f.match_id
        WHERE f.season_id = ${seasonId}
        UNION ALL
        SELECT
          f.away_team_id AS team_id,
          CASE WHEN mr.score_away > mr.score_home THEN 3
               WHEN mr.score_away = mr.score_home THEN 1
               ELSE 0 END AS pts,
          CASE WHEN mr.score_away > mr.score_home THEN 1 ELSE 0 END AS won,
          CASE WHEN mr.score_away = mr.score_home THEN 1 ELSE 0 END AS drawn,
          CASE WHEN mr.score_away < mr.score_home THEN 1 ELSE 0 END AS lost
        FROM fixtures f
        JOIN match_results mr ON mr.match_id = f.match_id
        WHERE f.season_id = ${seasonId}
      ),
      player_counts AS (
        SELECT team_id, COUNT(*)::int AS player_count
        FROM players
        WHERE season_id = ${seasonId} AND is_active = true
        GROUP BY team_id
      )
      SELECT
        t.team_id::text,
        t.team_name,
        COALESCE(pc.player_count, 0)   AS player_count,
        COALESCE(SUM(r.pts),   0)::int AS points,
        COALESCE(SUM(r.won),   0)::int AS won,
        COALESCE(SUM(r.drawn), 0)::int AS drawn,
        COALESCE(SUM(r.lost),  0)::int AS lost
      FROM teams t
      LEFT JOIN player_counts pc ON pc.team_id = t.team_id
      LEFT JOIN results        r  ON r.team_id  = t.team_id
      WHERE t.season_id = ${seasonId}
      GROUP BY t.team_id, t.team_name, pc.player_count
      ORDER BY t.team_name
    `
    return rows
  },
  key('teams-stats'),
  LEAGUE_CACHE
)

// ─── Players index ────────────────────────────────────────────────────────────

export const getAllPlayers = unstable_cache(
  async () => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        t.team_id::text,
        t.team_name
      FROM players p
      JOIN teams t ON t.team_id = p.team_id
      JOIN seasons s ON s.season_id = t.season_id
      WHERE p.is_active = true
        AND s.status = 'active'
      ORDER BY t.team_name, p.display_name
    `
    return rows
  },
  key('all-players'),
  LEAGUE_CACHE
)

// ─── Spirit ───────────────────────────────────────────────────────────────────

export const getSpiritLeaderboard = unstable_cache(
  async (seasonId: string) => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        t.team_id::text,
        t.team_name,
        COUNT(sn.nomination_id)::int AS nominations
      FROM spirit_nominations sn
      JOIN players p ON p.player_id = sn.nominated_player_id
      JOIN teams   t ON t.team_id   = p.team_id
      WHERE p.season_id = ${seasonId}::uuid
      GROUP BY p.player_id, p.display_name, t.team_id, t.team_name
      ORDER BY nominations DESC, p.display_name
    `
    return rows
  },
  key('spirit'),
  LEAGUE_CACHE
)

// ─── Stats page ───────────────────────────────────────────────────────────────

export type StatRow = {
  player_id:    string
  display_name: string
  team_name:    string
  team_id:      string
  appearances:  number
  total:        number
  per_game:     number | null
}

export type MatchweekRow = {
  player_id:    string
  display_name: string
  team_name:    string
  matchweek:    number
  cum_goals:    number
  cum_assists:  number
  cum_blocks:   number
  cum_apps:     number
}

export const getGoals = unstable_cache(
  async (seasonId: string): Promise<StatRow[]> => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        t.team_name,
        t.team_id::text,
        COUNT(pms.match_id)::int AS appearances,
        COALESCE(SUM(pms.goals), 0)::int AS total,
        CASE WHEN COUNT(pms.match_id) = 0 THEN NULL
             ELSE ROUND(COALESCE(SUM(pms.goals), 0)::numeric / COUNT(pms.match_id), 1)
        END AS per_game
      FROM players p
      JOIN teams t ON t.team_id = p.team_id
      LEFT JOIN player_match_stats pms ON pms.player_id = p.player_id
      WHERE p.is_active = true
        AND t.season_id = ${seasonId}
      GROUP BY p.player_id, p.display_name, t.team_name, t.team_id
      ORDER BY total DESC, per_game DESC NULLS LAST, p.display_name ASC
    `
    return rows.map((r) => ({
      player_id:    String(r.player_id),
      display_name: String(r.display_name),
      team_name:    String(r.team_name),
      team_id:      String(r.team_id),
      appearances:  Number(r.appearances),
      total:        Number(r.total),
      per_game:     r.per_game != null ? Number(r.per_game) : null,
    }))
  },
  key('goals'),
  LEAGUE_CACHE
)

export const getAssists = unstable_cache(
  async (seasonId: string): Promise<StatRow[]> => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        t.team_name,
        t.team_id::text,
        COUNT(pms.match_id)::int AS appearances,
        COALESCE(SUM(pms.assists), 0)::int AS total,
        CASE WHEN COUNT(pms.match_id) = 0 THEN NULL
             ELSE ROUND(COALESCE(SUM(pms.assists), 0)::numeric / COUNT(pms.match_id), 1)
        END AS per_game
      FROM players p
      JOIN teams t ON t.team_id = p.team_id
      LEFT JOIN player_match_stats pms ON pms.player_id = p.player_id
      WHERE p.is_active = true
        AND t.season_id = ${seasonId}
      GROUP BY p.player_id, p.display_name, t.team_name, t.team_id
      ORDER BY total DESC, per_game DESC NULLS LAST, p.display_name ASC
    `
    return rows.map((r) => ({
      player_id:    String(r.player_id),
      display_name: String(r.display_name),
      team_name:    String(r.team_name),
      team_id:      String(r.team_id),
      appearances:  Number(r.appearances),
      total:        Number(r.total),
      per_game:     r.per_game != null ? Number(r.per_game) : null,
    }))
  },
  key('assists'),
  LEAGUE_CACHE
)

export const getBlocks = unstable_cache(
  async (seasonId: string): Promise<StatRow[]> => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        t.team_name,
        t.team_id::text,
        COUNT(pms.match_id)::int AS appearances,
        COALESCE(SUM(pms.blocks), 0)::int AS total,
        CASE WHEN COUNT(pms.match_id) = 0 THEN NULL
             ELSE ROUND(COALESCE(SUM(pms.blocks), 0)::numeric / COUNT(pms.match_id), 1)
        END AS per_game
      FROM players p
      JOIN teams t ON t.team_id = p.team_id
      LEFT JOIN player_match_stats pms ON pms.player_id = p.player_id
      WHERE p.is_active = true
        AND t.season_id = ${seasonId}
      GROUP BY p.player_id, p.display_name, t.team_name, t.team_id
      ORDER BY total DESC, per_game DESC NULLS LAST, p.display_name ASC
    `
    return rows.map((r) => ({
      player_id:    String(r.player_id),
      display_name: String(r.display_name),
      team_name:    String(r.team_name),
      team_id:      String(r.team_id),
      appearances:  Number(r.appearances),
      total:        Number(r.total),
      per_game:     r.per_game != null ? Number(r.per_game) : null,
    }))
  },
  key('blocks'),
  LEAGUE_CACHE
)

export const getAppearances = unstable_cache(
  async (seasonId: string): Promise<StatRow[]> => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        t.team_name,
        t.team_id::text,
        COUNT(pms.match_id)::int AS appearances,
        COUNT(pms.match_id)::int AS total,
        NULL::numeric AS per_game
      FROM players p
      JOIN teams t ON t.team_id = p.team_id
      LEFT JOIN player_match_stats pms ON pms.player_id = p.player_id
      WHERE p.is_active = true
        AND t.season_id = ${seasonId}
      GROUP BY p.player_id, p.display_name, t.team_name, t.team_id
      ORDER BY total DESC, p.display_name ASC
    `
    return rows.map((r) => ({
      player_id:    String(r.player_id),
      display_name: String(r.display_name),
      team_name:    String(r.team_name),
      team_id:      String(r.team_id),
      appearances:  Number(r.appearances),
      total:        Number(r.total),
      per_game:     null,
    }))
  },
  key('appearances'),
  LEAGUE_CACHE
)

export const getMatchweekHistory = unstable_cache(
  async (seasonId: string): Promise<MatchweekRow[]> => {
    const rows = await sql`
      WITH matchweek_totals AS (
        SELECT
          pms.player_id::text,
          p.display_name,
          t.team_name,
          f.matchweek,
          SUM(pms.goals)::int    AS goals,
          SUM(pms.assists)::int  AS assists,
          SUM(pms.blocks)::int   AS blocks,
          COUNT(pms.match_id)::int AS apps
        FROM player_match_stats pms
        JOIN players  p ON p.player_id = pms.player_id
        JOIN teams    t ON t.team_id   = p.team_id
        JOIN fixtures f ON f.match_id  = pms.match_id
        WHERE t.season_id = ${seasonId}
        GROUP BY pms.player_id, p.display_name, t.team_name, f.matchweek
      )
      SELECT
        player_id,
        display_name,
        team_name,
        matchweek,
        SUM(goals)   OVER (PARTITION BY player_id ORDER BY matchweek)::int AS cum_goals,
        SUM(assists) OVER (PARTITION BY player_id ORDER BY matchweek)::int AS cum_assists,
        SUM(blocks)  OVER (PARTITION BY player_id ORDER BY matchweek)::int AS cum_blocks,
        SUM(apps)    OVER (PARTITION BY player_id ORDER BY matchweek)::int AS cum_apps
      FROM matchweek_totals
      ORDER BY player_id, matchweek
    `
    return rows.map((r) => ({
      player_id:    String(r.player_id),
      display_name: String(r.display_name),
      team_name:    String(r.team_name),
      matchweek:    Number(r.matchweek),
      cum_goals:    Number(r.cum_goals),
      cum_assists:  Number(r.cum_assists),
      cum_blocks:   Number(r.cum_blocks),
      cum_apps:     Number(r.cum_apps),
    }))
  },
  key('mw-history'),
  LEAGUE_CACHE
)

// ─── MVP page ─────────────────────────────────────────────────────────────────

export type MvpRow = {
  player_id:       string
  display_name:    string
  team_id:         string
  team_name:       string
  total_goals:     number
  total_assists:   number
  total_blocks:    number
  match_mvp_wins:  number
  composite_score: number
}

export type MvpHistoryRow = {
  player_id:     string
  display_name:  string
  team_name:     string
  matchweek:     number
  cum_composite: number
}

export const getMvpScores = unstable_cache(
  async (seasonId: string): Promise<MvpRow[]> => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        t.team_id::text,
        t.team_name,
        COALESCE(SUM(pms.goals),   0)::int AS total_goals,
        COALESCE(SUM(pms.assists), 0)::int AS total_assists,
        COALESCE(SUM(pms.blocks),  0)::int AS total_blocks,
        COUNT(mr.match_result_id)::int     AS match_mvp_wins,
        (COALESCE(SUM(pms.goals),   0) * 3
       + COALESCE(SUM(pms.assists), 0) * 3
       + COALESCE(SUM(pms.blocks),  0) * 2
       + COUNT(mr.match_result_id)    * 5)::int AS composite_score
      FROM players p
      JOIN teams t ON t.team_id = p.team_id
      LEFT JOIN player_match_stats pms ON pms.player_id = p.player_id
      LEFT JOIN fixtures f
             ON f.match_id  = pms.match_id
            AND f.season_id = p.season_id
      LEFT JOIN match_results mr
             ON mr.match_id       = pms.match_id
            AND mr.mvp_player_id  = p.player_id
      WHERE p.season_id = ${seasonId}::uuid
        AND p.is_active = true
      GROUP BY p.player_id, p.display_name, t.team_id, t.team_name
      ORDER BY composite_score DESC
    `
    return rows.map((r) => ({
      player_id:       String(r.player_id),
      display_name:    String(r.display_name),
      team_id:         String(r.team_id),
      team_name:       String(r.team_name),
      total_goals:     Number(r.total_goals),
      total_assists:   Number(r.total_assists),
      total_blocks:    Number(r.total_blocks),
      match_mvp_wins:  Number(r.match_mvp_wins),
      composite_score: Number(r.composite_score),
    }))
  },
  key('mvp-scores'),
  LEAGUE_CACHE
)

export const getMvpHistory = unstable_cache(
  async (seasonId: string): Promise<MvpHistoryRow[]> => {
    const rows = await sql`
      WITH matchweek_totals AS (
        SELECT
          pms.player_id::text,
          p.display_name,
          t.team_name,
          f.matchweek,
          SUM(pms.goals)::int   AS goals,
          SUM(pms.assists)::int AS assists,
          SUM(pms.blocks)::int  AS blocks,
          COUNT(mr.match_result_id)::int AS mvp_wins
        FROM player_match_stats pms
        JOIN players  p  ON p.player_id  = pms.player_id
        JOIN teams    t  ON t.team_id    = p.team_id
        JOIN fixtures f  ON f.match_id   = pms.match_id
        LEFT JOIN match_results mr
               ON mr.match_id        = pms.match_id
              AND mr.mvp_player_id   = pms.player_id
        WHERE t.season_id = ${seasonId}
        GROUP BY pms.player_id, p.display_name, t.team_name, f.matchweek
      )
      SELECT
        player_id,
        display_name,
        team_name,
        matchweek,
        SUM(goals * 3 + assists * 3 + blocks * 2 + mvp_wins * 5)
          OVER (PARTITION BY player_id ORDER BY matchweek)::int AS cum_composite
      FROM matchweek_totals
      ORDER BY player_id, matchweek
    `
    return rows.map((r) => ({
      player_id:     String(r.player_id),
      display_name:  String(r.display_name),
      team_name:     String(r.team_name),
      matchweek:     Number(r.matchweek),
      cum_composite: Number(r.cum_composite),
    }))
  },
  key('mvp-history'),
  LEAGUE_CACHE
)

// ─── Match page ───────────────────────────────────────────────────────────────

export const getMatch = unstable_cache(
  async (matchId: string) => {
    const rows = await sql`
      SELECT
        f.match_id::text,
        f.matchweek,
        f.kickoff_time,
        f.status,
        f.venue,
        ht.team_id::text AS home_team_id,
        ht.team_name     AS home_team_name,
        at.team_id::text AS away_team_id,
        at.team_name     AS away_team_name,
        mr.score_home,
        mr.score_away,
        mvp.display_name AS mvp_name,
        mvp.player_id::text AS mvp_id
      FROM fixtures f
      JOIN  teams ht ON ht.team_id = f.home_team_id
      JOIN  teams at ON at.team_id = f.away_team_id
      LEFT JOIN match_results mr  ON mr.match_id  = f.match_id
      LEFT JOIN players mvp       ON mvp.player_id = mr.mvp_player_id
      WHERE f.match_id = ${matchId}
      LIMIT 1
    `
    return rows[0] ?? null
  },
  key('match'),
  LEAGUE_CACHE
)

export const getPlayerStats = unstable_cache(
  async (matchId: string) => {
    const rows = await sql`
      SELECT
        pms.player_id::text,
        p.display_name,
        pms.team_id::text,
        pms.goals,
        pms.assists,
        pms.blocks
      FROM player_match_stats pms
      JOIN players p ON p.player_id = pms.player_id
      WHERE pms.match_id = ${matchId}
      ORDER BY p.display_name
    `
    return rows
  },
  key('match-stats'),
  LEAGUE_CACHE
)

export const getAbsences = unstable_cache(
  async (matchId: string) => {
    const rows = await sql`
      SELECT
        ma.player_id::text,
        p.display_name,
        ma.team_id::text
      FROM match_absences ma
      JOIN players p ON p.player_id = ma.player_id
      WHERE ma.match_id = ${matchId}
      ORDER BY p.display_name
    `
    return rows
  },
  key('match-absences'),
  LEAGUE_CACHE
)

export const getSpiritNominations = unstable_cache(
  async (matchId: string) => {
    const rows = await sql`
      SELECT
        sn.nominating_team_id::text,
        nt.team_name          AS nominating_team_name,
        sn.nominated_player_id::text,
        p.display_name        AS nominated_player_name
      FROM spirit_nominations sn
      JOIN teams   nt ON nt.team_id   = sn.nominating_team_id
      JOIN players p  ON p.player_id  = sn.nominated_player_id
      WHERE sn.match_id = ${matchId}
    `
    return rows
  },
  key('match-nominations'),
  LEAGUE_CACHE
)

export const getTeamRoster = unstable_cache(
  async (teamId: string) => {
    const rows = await sql`
      SELECT player_id::text, display_name
      FROM players
      WHERE team_id = ${teamId} AND is_active = true
      ORDER BY display_name
    `
    return rows
  },
  key('team-roster'),
  LEAGUE_CACHE
)

// ─── Team page ────────────────────────────────────────────────────────────────

export const getTeam = unstable_cache(
  async (teamId: string) => {
    const rows = await sql`
      SELECT team_id::text, team_name, season_id::text
      FROM teams
      WHERE team_id = ${teamId}
      LIMIT 1
    `
    return rows[0] ?? null
  },
  key('team'),
  LEAGUE_CACHE
)

export const getRoster = unstable_cache(
  async (teamId: string) => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        COALESCE(SUM(pms.goals),   0)::int AS goals,
        COALESCE(SUM(pms.assists), 0)::int AS assists,
        COALESCE(SUM(pms.blocks),  0)::int AS blocks,
        COUNT(pms.stat_id)::int            AS appearances
      FROM players p
      LEFT JOIN player_match_stats pms ON pms.player_id = p.player_id
      WHERE p.team_id = ${teamId} AND p.is_active = true
      GROUP BY p.player_id, p.display_name
      ORDER BY p.display_name
    `
    return rows
  },
  key('team-roster-with-stats'),
  LEAGUE_CACHE
)

export const getUpcomingFixtures = unstable_cache(
  async (teamId: string) => {
    const rows = await sql`
      SELECT
        f.match_id::text,
        f.matchweek,
        f.kickoff_time,
        ht.team_id::text AS home_team_id,
        ht.team_name     AS home_team_name,
        at.team_id::text AS away_team_id,
        at.team_name     AS away_team_name
      FROM fixtures f
      JOIN  teams ht ON ht.team_id = f.home_team_id
      JOIN  teams at ON at.team_id = f.away_team_id
      WHERE (f.home_team_id = ${teamId} OR f.away_team_id = ${teamId})
        AND f.status = 'scheduled'
        AND f.kickoff_time > NOW()
      ORDER BY f.kickoff_time ASC
      LIMIT 2
    `
    return rows
  },
  key('team-upcoming'),
  LEAGUE_CACHE
)

// Deferred perf note (plan 002): scans all seasons — no season_id filter.
// Fix separately with EXPLAIN evidence; centralization makes it a one-file edit.
export const getTeamRecord = unstable_cache(
  async (teamId: string) => {
    const rows = await sql`
      WITH results AS (
        SELECT
          f.home_team_id AS tid,
          mr.score_home  AS gf,
          mr.score_away  AS ga,
          CASE WHEN mr.score_home > mr.score_away THEN 3
               WHEN mr.score_home = mr.score_away THEN 1
               ELSE 0 END AS pts,
          CASE WHEN mr.score_home > mr.score_away THEN 1 ELSE 0 END AS won,
          CASE WHEN mr.score_home = mr.score_away THEN 1 ELSE 0 END AS drawn,
          CASE WHEN mr.score_home < mr.score_away THEN 1 ELSE 0 END AS lost
        FROM fixtures f
        JOIN match_results mr ON mr.match_id = f.match_id
        UNION ALL
        SELECT
          f.away_team_id AS tid,
          mr.score_away  AS gf,
          mr.score_home  AS ga,
          CASE WHEN mr.score_away > mr.score_home THEN 3
               WHEN mr.score_away = mr.score_home THEN 1
               ELSE 0 END AS pts,
          CASE WHEN mr.score_away > mr.score_home THEN 1 ELSE 0 END AS won,
          CASE WHEN mr.score_away = mr.score_home THEN 1 ELSE 0 END AS drawn,
          CASE WHEN mr.score_away < mr.score_home THEN 1 ELSE 0 END AS lost
        FROM fixtures f
        JOIN match_results mr ON mr.match_id = f.match_id
      )
      SELECT
        COUNT(tid)::int             AS played,
        COALESCE(SUM(won),   0)::int AS won,
        COALESCE(SUM(drawn), 0)::int AS drawn,
        COALESCE(SUM(lost),  0)::int AS lost,
        COALESCE(SUM(gf),    0)::int AS points_for,
        COALESCE(SUM(ga),    0)::int AS points_against,
        COALESCE(SUM(pts),   0)::int AS points
      FROM results
      WHERE tid = ${teamId}
    `
    return rows[0] ?? null
  },
  key('team-record'),
  LEAGUE_CACHE
)

export const getHeadToHead = unstable_cache(
  async (teamId: string, seasonId: string) => {
    const rows = await sql`
      SELECT
        opp.team_id::text   AS opponent_team_id,
        opp.team_name       AS opponent_name,
        COALESCE(h2h.won,   0)::int AS won,
        COALESCE(h2h.drawn, 0)::int AS drawn,
        COALESCE(h2h.lost,  0)::int AS lost,
        COALESCE(h2h.points_for,     0)::int AS points_for,
        COALESCE(h2h.points_against, 0)::int AS points_against,
        h2h.played
      FROM teams opp
      LEFT JOIN (
        SELECT
          opponent_team_id,
          SUM(CASE WHEN my_score > opp_score THEN 1 ELSE 0 END)::int AS won,
          SUM(CASE WHEN my_score = opp_score THEN 1 ELSE 0 END)::int AS drawn,
          SUM(CASE WHEN my_score < opp_score THEN 1 ELSE 0 END)::int AS lost,
          SUM(my_score)::int   AS points_for,
          SUM(opp_score)::int  AS points_against,
          COUNT(*)::int        AS played
        FROM (
          SELECT
            f.away_team_id AS opponent_team_id,
            mr.score_home  AS my_score,
            mr.score_away  AS opp_score
          FROM fixtures f
          JOIN match_results mr ON mr.match_id = f.match_id
          WHERE f.home_team_id = ${teamId}
          UNION ALL
          SELECT
            f.home_team_id AS opponent_team_id,
            mr.score_away  AS my_score,
            mr.score_home  AS opp_score
          FROM fixtures f
          JOIN match_results mr ON mr.match_id = f.match_id
          WHERE f.away_team_id = ${teamId}
        ) sub
        GROUP BY opponent_team_id
      ) h2h ON h2h.opponent_team_id = opp.team_id
      WHERE opp.season_id = ${seasonId}
        AND opp.team_id != ${teamId}
      ORDER BY opp.team_name ASC
    `
    return rows
  },
  key('team-h2h'),
  LEAGUE_CACHE
)

export const getRecentFixtures = unstable_cache(
  async (teamId: string) => {
    const rows = await sql`
      SELECT
        f.match_id::text,
        f.matchweek,
        f.kickoff_time,
        f.status,
        ht.team_id::text AS home_team_id,
        ht.team_name     AS home_team_name,
        at.team_id::text AS away_team_id,
        at.team_name     AS away_team_name,
        mr.score_home,
        mr.score_away
      FROM fixtures f
      JOIN  teams ht ON ht.team_id = f.home_team_id
      JOIN  teams at ON at.team_id = f.away_team_id
      LEFT JOIN match_results mr ON mr.match_id = f.match_id
      WHERE (f.home_team_id = ${teamId} OR f.away_team_id = ${teamId})
      ORDER BY f.kickoff_time DESC
      LIMIT 5
    `
    return rows
  },
  key('team-recent'),
  LEAGUE_CACHE
)

// ─── Player page ──────────────────────────────────────────────────────────────

export const getPlayer = unstable_cache(
  async (playerId: string) => {
    const rows = await sql`
      SELECT
        p.player_id::text,
        p.display_name,
        p.team_id::text,
        t.team_name,
        t.season_id::text
      FROM players p
      JOIN teams t ON t.team_id = p.team_id
      WHERE p.player_id = ${playerId}
      LIMIT 1
    `
    return rows[0] ?? null
  },
  key('player'),
  LEAGUE_CACHE
)

export const getSpiritNominationsReceived = unstable_cache(
  async (playerId: string) => {
    const rows = await sql`
      SELECT COUNT(*)::int AS total
      FROM spirit_nominations
      WHERE nominated_player_id = ${playerId}
    `
    return rows[0] ? Number(rows[0].total) : 0
  },
  key('player-spirit'),
  LEAGUE_CACHE
)

export const getSeasonTotals = unstable_cache(
  async (playerId: string) => {
    const rows = await sql`
      SELECT
        COUNT(*)::int          AS appearances,
        COALESCE(SUM(goals),   0)::int AS total_goals,
        COALESCE(SUM(assists), 0)::int AS total_assists,
        COALESCE(SUM(blocks),  0)::int AS total_blocks
      FROM player_match_stats
      WHERE player_id = ${playerId}
    `
    return rows[0] ?? null
  },
  key('player-totals'),
  LEAGUE_CACHE
)

export const getMatchLog = unstable_cache(
  async (playerId: string, teamId: string) => {
    const rows = await sql`
      SELECT
        f.match_id::text,
        f.kickoff_time,
        ht.team_id::text AS home_team_id,
        ht.team_name     AS home_team_name,
        at.team_id::text AS away_team_id,
        at.team_name     AS away_team_name,
        mr.score_home,
        mr.score_away,
        pms.goals,
        pms.assists,
        pms.blocks
      FROM player_match_stats pms
      JOIN fixtures f     ON f.match_id  = pms.match_id
      JOIN teams ht       ON ht.team_id  = f.home_team_id
      JOIN teams at       ON at.team_id  = f.away_team_id
      JOIN match_results mr ON mr.match_id = f.match_id
      WHERE pms.player_id = ${playerId}
      ORDER BY f.kickoff_time DESC
    `
    return rows.map((r) => {
      const isHome   = (r.home_team_id as string) === teamId
      const opponent = isHome ? (r.away_team_name as string) : (r.home_team_name as string)
      const oppId    = isHome ? (r.away_team_id as string)   : (r.home_team_id as string)
      const myScore  = isHome ? Number(r.score_home) : Number(r.score_away)
      const oppScore = isHome ? Number(r.score_away) : Number(r.score_home)
      const result   = myScore > oppScore ? 'W' : myScore < oppScore ? 'L' : 'D'
      return {
        match_id: r.match_id as string,
        kickoff_time: r.kickoff_time as string,
        opponent,
        oppId,
        myScore,
        oppScore,
        result,
        goals:   Number(r.goals),
        assists: Number(r.assists),
        blocks:  Number(r.blocks),
      }
    })
  },
  key('player-matchlog'),
  LEAGUE_CACHE
)
