import Link from 'next/link'
import {
  getActiveSeason,
  getCachedStandings,
  getCachedHistoricalStandings,
  getFormGuide,
} from '@/lib/league-queries'
import PublicNav from '../_components/PublicNav'
import StandingsChart from './StandingsChart'
import { TeamAvatar } from '../_components/Avatar'

export const dynamic = 'force-dynamic'

function FormGuide({ form }: { form: ('W' | 'D' | 'L')[] }) {
  const colours = { W: 'bg-green-500', D: 'bg-gray-500', L: 'bg-red-500' }
  return (
    <div className="flex gap-1">
      {form.map((r, i) => (
        <span
          key={i}
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${colours[r]}`}
        >
          {r}
        </span>
      ))}
    </div>
  )
}

export default async function StandingsPage() {
  let season = null
  try { season = await getActiveSeason() } catch {}

  const data = season
    ? await Promise.all([
        getCachedStandings(season.season_id as string),
        getFormGuide(season.season_id as string),
        getCachedHistoricalStandings(season.season_id as string),
      ]).catch(() => null)
    : null

  const [standings, formGuide, historicalData] = data
    ?? [[], {} as Record<string, ('W' | 'D' | 'L')[]>, []]

  const teamOrder = standings.map((row) => row.team_id)

  return (
    <div className="page-shell">
      <PublicNav />
      <div className="page-container-wide">
        <h1 className="page-heading">Standings</h1>
        {season && (
          <p className="page-subheading">{season.season_name as string}</p>
        )}

        <div className="space-y-6">
          {/* Standings table */}
          <div className="card-list overflow-clip">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="table-th table-th-l text-left w-6">#</th>
                    <th className="table-th table-th-l text-left">Team</th>
                    <th className="table-th table-th-sm text-right">P</th>
                    <th className="table-th table-th-sm text-right">W</th>
                    <th className="table-th table-th-sm text-right">D</th>
                    <th className="table-th table-th-sm text-right">L</th>
                    <th className="table-th table-th-sm text-right">PS</th>
                    <th className="table-th table-th-sm text-right">PA</th>
                    <th className="table-th table-th-sm text-right">PD</th>
                    <th className="table-th table-th-sm">Form</th>
                    <th className="table-th table-th-r text-right sticky right-0 z-10 bg-gray-900">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr key={row.team_id} className="table-row">
                      <td className="table-td table-td-l text-gray-500 text-xs">{i + 1}</td>
                      <td className="table-td table-td-l font-medium">
                        <div className="flex items-center gap-2">
                          <TeamAvatar id={row.team_id} name={row.team_name} size={20} />
                          <Link href={`/league/team/${row.team_id}`} className="link-accent">
                            {row.team_name}
                          </Link>
                        </div>
                      </td>
                      <td className="table-td table-td-sm text-right text-gray-400">{row.played}</td>
                      <td className="table-td table-td-sm text-right">{row.won}</td>
                      <td className="table-td table-td-sm text-right text-gray-400">{row.drawn}</td>
                      <td className="table-td table-td-sm text-right">{row.lost}</td>
                      <td className="table-td table-td-sm text-right text-gray-400">{row.points_for}</td>
                      <td className="table-td table-td-sm text-right text-gray-400">{row.points_against}</td>
                      <td className="table-td table-td-sm text-right">
                        <span
                          className={
                            row.point_diff > 0
                              ? 'text-green-400'
                              : row.point_diff < 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }
                        >
                          {row.point_diff > 0 ? `+${row.point_diff}` : row.point_diff}
                        </span>
                      </td>
                      <td className="table-td table-td-sm">
                        <FormGuide form={formGuide[row.team_id] ?? []} />
                      </td>
                      <td className="table-td table-td-r text-right font-bold text-green-400 sticky right-0 z-10 bg-gray-900">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-xs text-gray-600 -mt-2 space-y-1">
            <p className="font-medium text-gray-500">Tiebreaker order (when teams are level on points):</p>
            <ol className="space-y-1 list-none">
              <li><span className="text-gray-400">1. Point difference (PD)</span> — points scored minus points conceded across all matches. A higher PD ranks above a lower one.</li>
              <li><span className="text-gray-400">2. Head-to-head</span> — the result of the match(es) played directly between the tied teams. The team that won that encounter ranks higher.</li>
              <li><span className="text-gray-400">3. Points scored (PS)</span> — total points scored across all matches. Used only if PD and head-to-head are also identical.</li>
            </ol>
          </div>

          {/* Position history chart */}
          <div className="card">
            <h2 className="section-label mb-4">Position History</h2>
            <StandingsChart data={historicalData} teamOrder={teamOrder} />
          </div>
        </div>
      </div>
    </div>
  )
}
