import sql from '@/lib/league-db'

export interface StandingRow {
  team_id: string
  team_name: string
  played: number
  won: number
  drawn: number
  lost: number
  points_for: number
  points_against: number
  point_diff: number
  points: number
}

export async function getStandings(seasonId: string): Promise<StandingRow[]> {
  const rows = await sql`
    WITH results AS (
      SELECT
        f.home_team_id AS team_id,
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
      WHERE f.season_id = ${seasonId}
      UNION ALL
      SELECT
        f.away_team_id AS team_id,
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
      WHERE f.season_id = ${seasonId}
    )
    SELECT
      t.team_id::text,
      t.team_name,
      COUNT(r.team_id)::int                                          AS played,
      COALESCE(SUM(r.won),  0)::int                                  AS won,
      COALESCE(SUM(r.drawn),0)::int                                  AS drawn,
      COALESCE(SUM(r.lost), 0)::int                                  AS lost,
      COALESCE(SUM(r.gf),   0)::int                                  AS points_for,
      COALESCE(SUM(r.ga),   0)::int                                  AS points_against,
      (COALESCE(SUM(r.gf),  0) - COALESCE(SUM(r.ga), 0))::int       AS point_diff,
      COALESCE(SUM(r.pts),  0)::int                                  AS points
    FROM teams t
    LEFT JOIN results r ON r.team_id = t.team_id
    WHERE t.season_id = ${seasonId}
    GROUP BY t.team_id, t.team_name
    ORDER BY points DESC, played DESC, point_diff DESC, points_for DESC
  `

  return rows.map((r) => ({
    team_id:        String(r.team_id),
    team_name:      String(r.team_name),
    played:         Number(r.played),
    won:            Number(r.won),
    drawn:          Number(r.drawn),
    lost:           Number(r.lost),
    points_for:     Number(r.points_for),
    points_against: Number(r.points_against),
    point_diff:     Number(r.point_diff),
    points:         Number(r.points),
  }))
}

export interface HistoricalPosition {
  matchweek: number
  team_id:   string
  team_name: string
  position:  number
}

export async function getHistoricalStandings(seasonId: string): Promise<HistoricalPosition[]> {
  const rows = await sql`
    WITH
    match_rows AS (
      SELECT f.matchweek, f.home_team_id AS team_id,
             mr.score_home AS gf, mr.score_away AS ga,
             CASE WHEN mr.score_home > mr.score_away THEN 3
                  WHEN mr.score_home = mr.score_away THEN 1
                  ELSE 0 END AS pts
      FROM fixtures f JOIN match_results mr ON mr.match_id = f.match_id
      WHERE f.season_id = ${seasonId}
      UNION ALL
      SELECT f.matchweek, f.away_team_id AS team_id,
             mr.score_away AS gf, mr.score_home AS ga,
             CASE WHEN mr.score_away > mr.score_home THEN 3
                  WHEN mr.score_away = mr.score_home THEN 1
                  ELSE 0 END AS pts
      FROM fixtures f JOIN match_results mr ON mr.match_id = f.match_id
      WHERE f.season_id = ${seasonId}
    ),
    max_mw AS (
      SELECT COALESCE(MAX(matchweek), 0) AS val FROM match_rows
    ),
    team_mw AS (
      SELECT t.team_id, t.team_name, g.mw
      FROM teams t
      CROSS JOIN LATERAL generate_series(1, (SELECT val FROM max_mw)) AS g(mw)
      WHERE t.season_id = ${seasonId}
    ),
    cumulative AS (
      SELECT
        tm.mw                                        AS matchweek,
        tm.team_id,
        tm.team_name,
        COALESCE(COUNT(mr.matchweek), 0)::int         AS played,
        COALESCE(SUM(mr.pts), 0)::int                AS points,
        COALESCE(SUM(mr.gf - mr.ga), 0)::int         AS point_diff,
        COALESCE(SUM(mr.gf), 0)::int                 AS points_for
      FROM team_mw tm
      LEFT JOIN match_rows mr ON mr.team_id = tm.team_id AND mr.matchweek <= tm.mw
      GROUP BY tm.mw, tm.team_id, tm.team_name
    )
    SELECT
      matchweek,
      team_id::text,
      team_name,
      RANK() OVER (
        PARTITION BY matchweek
        ORDER BY points DESC, played DESC, point_diff DESC, points_for DESC
      )::int AS position
    FROM cumulative
    ORDER BY matchweek, position
  `
  return rows.map((r) => ({
    matchweek: Number(r.matchweek),
    team_id:   String(r.team_id),
    team_name: String(r.team_name),
    position:  Number(r.position),
  }))
}
