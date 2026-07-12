import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getTeam,
  getRoster,
  getUpcomingFixtures,
  getTeamRecord,
  getHeadToHead,
  getRecentFixtures,
  getCachedStandings,
} from '@/lib/league-queries'
import { ordinal } from '@/lib/league-utils'
import PublicNav from '../../_components/PublicNav'
import StatCard from '../../_components/StatCard'
import { TeamAvatar } from '../../_components/Avatar'

export const dynamic = 'force-dynamic'

function fmtKickoff(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  })
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params
  const team = await getTeam(teamId)
  if (!team) notFound()

  const [roster, record, recent, upcoming, h2h, standings] = await Promise.all([
    getRoster(teamId),
    getTeamRecord(teamId),
    getRecentFixtures(teamId),
    getUpcomingFixtures(teamId),
    getHeadToHead(teamId, team.season_id as string),
    getCachedStandings(team.season_id as string),
  ])

  const leaguePosition = standings.findIndex((s) => s.team_id === teamId) + 1

  const won    = record ? Number(record.won)    : 0
  const drawn  = record ? Number(record.drawn)  : 0
  const lost   = record ? Number(record.lost)   : 0
  const played = record ? Number(record.played) : 0
  const pts    = record ? Number(record.points) : 0
  const pf     = record ? Number(record.points_for)    : 0
  const pa     = record ? Number(record.points_against) : 0

  return (
    <div className="page-shell">
      <PublicNav />
      <div className="page-container space-y-6">

        {/* Team header */}
        <div className="card-p5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <TeamAvatar id={teamId} name={team.team_name as string} size={64} />
              <h1 className="page-heading">{team.team_name as string}</h1>
            </div>
            {leaguePosition > 0 && (
              <span className="badge badge-meta shrink-0 ml-3 mt-1">
                {ordinal(leaguePosition)}
              </span>
            )}
          </div>
          {played > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              <StatCard label="Pts" value={pts}   highlight size="sm" />
              <StatCard label="W"   value={won}   size="sm" />
              <StatCard label="D"   value={drawn} size="sm" />
              <StatCard label="L"   value={lost}  size="sm" />
            </div>
          ) : (
            <p className="text-sm text-gray-400">No results yet · {roster.length} players</p>
          )}
          {played > 0 && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              {played} played · {pf} PF · {pa} PA · PD {pf - pa > 0 ? `+${pf - pa}` : pf - pa}
            </p>
          )}
        </div>

        {/* Roster with season stats */}
        <div>
          <h2 className="section-label">Roster ({roster.length})</h2>
          <div className="card-list">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="table-th table-th-l text-left">Player</th>
                  <th className="table-th table-th-sm text-right">G</th>
                  <th className="table-th table-th-sm text-right">A</th>
                  <th className="table-th table-th-sm text-right">B</th>
                  <th className="table-th table-th-r text-right"></th>
                </tr>
              </thead>
              <tbody>
                {roster.map((p) => (
                  <tr key={p.player_id as string} className="table-row-hover">
                    <td className="table-td table-td-l">
                      <Link href={`/league/player/${p.player_id as string}`} className="link-accent">
                        {p.display_name as string}
                      </Link>
                    </td>
                    <td className="table-td table-td-sm text-right tabular-nums text-gray-400">{Number(p.goals)}</td>
                    <td className="table-td table-td-sm text-right tabular-nums text-gray-400">{Number(p.assists)}</td>
                    <td className="table-td table-td-sm text-right tabular-nums text-gray-400">{Number(p.blocks)}</td>
                    <td className="table-td table-td-r text-right text-gray-600">›</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent fixtures */}
        {recent.length > 0 && (
          <div>
            <h2 className="section-label">Recent Fixtures</h2>
            <div className="card-list divide-y divide-gray-800">
              {recent.map((f) => {
                const isHome   = (f.home_team_id as string) === teamId
                const opponent = isHome
                  ? (f.away_team_name as string)
                  : (f.home_team_name as string)
                const played   = f.score_home != null
                let result: { label: string; cls: string } | null = null
                if (played) {
                  const myScore  = isHome ? Number(f.score_home)  : Number(f.score_away)
                  const oppScore = isHome ? Number(f.score_away)  : Number(f.score_home)
                  if (myScore > oppScore)      result = { label: 'W', cls: 'text-green-400' }
                  else if (myScore < oppScore) result = { label: 'L', cls: 'text-red-400'   }
                  else                         result = { label: 'D', cls: 'text-gray-400'  }
                }
                return (
                  <Link
                    key={f.match_id as string}
                    href={`/league/match/${f.match_id as string}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-sm"
                  >
                    <span className="text-xs text-gray-500 w-16 shrink-0">
                      {fmtKickoff(f.kickoff_time as string)}
                    </span>
                    <span className="flex-1 truncate">{opponent}</span>
                    {played && result ? (
                      <span className={`text-sm font-bold tabular-nums shrink-0 ${result.cls}`}>
                        {result.label}&nbsp;
                        {isHome
                          ? `${Number(f.score_home)}–${Number(f.score_away)}`
                          : `${Number(f.score_away)}–${Number(f.score_home)}`}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 shrink-0">
                        MW{Number(f.matchweek)}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Upcoming fixtures */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="section-label">Upcoming</h2>
            <div className="card-list divide-y divide-gray-800">
              {upcoming.map((f) => {
                const isHome   = (f.home_team_id as string) === teamId
                const opponent = isHome ? (f.away_team_name as string) : (f.home_team_name as string)
                return (
                  <Link
                    key={f.match_id as string}
                    href={`/league/match/${f.match_id as string}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-sm"
                  >
                    <span className="text-xs text-gray-500 w-16 shrink-0">
                      {fmtKickoff(f.kickoff_time as string)}
                    </span>
                    <span className="text-sm flex-1 truncate">{opponent}</span>
                    <span className="text-xs text-gray-500 shrink-0">
                      {isHome ? 'H' : 'A'} · MW{Number(f.matchweek)}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Head-to-head */}
        {h2h.length > 0 && (
          <div>
            <h2 className="section-label">Head-to-Head</h2>
            <div className="card-list divide-y divide-gray-800">
              {h2h.map((opp) => {
                const hasPlayed = opp.played != null && Number(opp.played) > 0
                return (
                  <div
                    key={opp.opponent_team_id as string}
                    className="flex items-center px-4 py-3 gap-3"
                  >
                    <Link
                      href={`/league/team/${opp.opponent_team_id as string}`}
                      className="text-sm flex-1 link-accent"
                    >
                      {opp.opponent_name as string}
                    </Link>
                    {hasPlayed ? (
                      <span className="text-sm tabular-nums text-gray-400 shrink-0">
                        <span className="text-green-400 font-medium">{Number(opp.won)}W</span>
                        {' · '}
                        {Number(opp.drawn)}D
                        {' · '}
                        <span className="text-red-400">{Number(opp.lost)}L</span>
                        {'  '}
                        <span className="text-gray-500 text-xs ml-1">
                          {Number(opp.points_for)}–{Number(opp.points_against)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600 shrink-0">—</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
