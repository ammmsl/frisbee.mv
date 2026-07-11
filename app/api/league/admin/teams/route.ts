import { NextResponse } from 'next/server'
import sql from '@/lib/league-db'
import { getAdminSession } from '@/lib/league-auth'

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const teams = await sql`
    SELECT
      t.team_id,
      t.team_name,
      t.season_id,
      COALESCE(
        json_agg(
          json_build_object('player_id', p.player_id, 'display_name', p.display_name)
          ORDER BY p.display_name
        ) FILTER (WHERE p.player_id IS NOT NULL),
        '[]'
      ) AS players
    FROM teams t
    LEFT JOIN players p ON p.team_id = t.team_id AND p.is_active = true
    GROUP BY t.team_id, t.team_name, t.season_id
    ORDER BY t.team_name
  `
  return NextResponse.json(teams)
}
