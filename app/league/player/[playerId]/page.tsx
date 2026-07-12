import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getPlayer,
  getSpiritNominationsReceived,
  getSeasonTotals,
  getMatchLog,
  getCachedStandings,
} from '@/lib/league-queries'
import { ordinal } from '@/lib/league-utils'
import PublicNav from '../../_components/PublicNav'
import StatCard from '../../_components/StatCard'
import { PlayerAvatar } from '../../_components/Avatar'

export const dynamic = 'force-dynamic'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    month: 'short',
    day:   'numeric',
  })
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>
}) {
  const { playerId } = await params
  const player = await getPlayer(playerId)
  if (!player) notFound()

  const [totals, matchLog, spiritTotal, standings] = await Promise.all([
    getSeasonTotals(playerId),
    getMatchLog(playerId, player.team_id as string),
    getSpiritNominationsReceived(playerId),
    getCachedStandings(player.season_id as string),
  ])

  const leaguePosition = standings.findIndex((s) => s.team_id === (player.team_id as string)) + 1

  const appearances  = totals ? Number(totals.appearances)   : 0
  const totalGoals   = totals ? Number(totals.total_goals)   : 0
  const totalAssists = totals ? Number(totals.total_assists)  : 0
  const totalBlocks  = totals ? Number(totals.total_blocks)   : 0

  return (
    <div className="page-shell">
      <PublicNav />
      <div className="page-container space-y-6">

        {/* Header */}
        <div className="card-p5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <PlayerAvatar id={player.player_id as string} name={player.display_name as string} size={56} />
              <div>
                <h1 className="page-heading">{player.display_name as string}</h1>
                <Link
                  href={`/league/team/${player.team_id as string}`}
                  className="link-accent text-sm mt-1 inline-block"
                >
                  {player.team_name as string}
                  {leaguePosition > 0 && (
                    <span className="text-gray-500 ml-1">· {ordinal(leaguePosition)}</span>
                  )}
                </Link>
              </div>
            </div>
            {spiritTotal > 0 && (
              <div className="text-center shrink-0 ml-4">
                <p className="text-xl font-bold text-green-400">{spiritTotal}</p>
                <p className="text-xs text-gray-400 mt-0.5">✨ Spirit</p>
              </div>
            )}
          </div>
        </div>

        {/* Season totals */}
        <div>
          <h2 className="section-label">Season Totals</h2>
          <div className="grid grid-cols-4 gap-2">
            <StatCard label="Apps"    value={appearances}  />
            <StatCard label="Goals"   value={totalGoals}   />
            <StatCard label="Assists" value={totalAssists} />
            <StatCard label="Blocks"  value={totalBlocks}  />
          </div>
        </div>

        {/* Match log */}
        {matchLog.length > 0 && (
          <div>
            <h2 className="section-label">Match Log</h2>
            <div className="card-list overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="table-th table-th-l text-left">Date</th>
                    <th className="table-th table-th-sm text-left">Opponent</th>
                    <th className="table-th table-th-sm text-right">Res</th>
                    <th className="table-th table-th-sm text-right">G</th>
                    <th className="table-th table-th-sm text-right">A</th>
                    <th className="table-th table-th-r text-right">B</th>
                  </tr>
                </thead>
                <tbody>
                  {matchLog.map((m) => (
                    <tr key={m.match_id} className="table-row">
                      <td className="table-td table-td-l text-gray-400 text-xs whitespace-nowrap">
                        {fmtDate(m.kickoff_time)}
                      </td>
                      <td className="table-td table-td-sm truncate max-w-[7rem]">
                        <Link
                          href={`/league/team/${m.oppId}`}
                          className="link-accent"
                        >
                          {m.opponent}
                        </Link>
                      </td>
                      <td className="table-td table-td-sm text-right">
                        <span
                          className={
                            m.result === 'W'
                              ? 'text-green-400 font-bold'
                              : m.result === 'L'
                              ? 'text-red-400 font-bold'
                              : 'text-gray-400'
                          }
                        >
                          {m.result} {m.myScore}–{m.oppScore}
                        </span>
                      </td>
                      <td className="table-td table-td-sm text-right tabular-nums">{m.goals}</td>
                      <td className="table-td table-td-sm text-right tabular-nums">{m.assists}</td>
                      <td className="table-td table-td-r text-right tabular-nums">{m.blocks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {matchLog.length === 0 && (
          <div className="empty-state">No match appearances yet.</div>
        )}

      </div>
    </div>
  )
}
