import Link from 'next/link'
import { getActiveSeason, getSpiritLeaderboard } from '@/lib/league-queries'
import PublicNav from '../_components/PublicNav'

export const dynamic = 'force-dynamic'

export default async function SpiritPage() {
  let seasonId: string | null = null
  try { seasonId = (await getActiveSeason())?.season_id ?? null } catch {}

  const leaderboard = seasonId
    ? await getSpiritLeaderboard(seasonId).catch(() => [])
    : []

  return (
    <div className="page-shell">
      <PublicNav />
      <div className="page-container">
        <h1 className="page-heading">Spirit</h1>
        <p className="page-subheading">Season spirit nominations leaderboard</p>

        {leaderboard.length === 0 ? (
          <div className="empty-state">
            <p>No spirit nominations recorded yet.</p>
          </div>
        ) : (
          <div className="card-list">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="table-th table-th-l text-left w-8">#</th>
                  <th className="table-th table-th-l text-left">Player</th>
                  <th className="table-th table-th-l text-left">Team</th>
                  <th className="table-th table-th-r text-right">Nominations</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, i) => (
                  <tr key={row.player_id as string} className="table-row">
                    <td className="table-td table-td-l text-gray-500 text-xs">{i + 1}</td>
                    <td className="table-td table-td-l font-medium">
                      <Link
                        href={`/league/player/${row.player_id as string}`}
                        className="link-accent"
                      >
                        {row.display_name as string}
                      </Link>
                    </td>
                    <td className="table-td table-td-l text-gray-400">
                      <Link
                        href={`/league/team/${row.team_id as string}`}
                        className="link-muted"
                      >
                        {row.team_name as string}
                      </Link>
                    </td>
                    <td className="table-td table-td-r text-right font-bold text-green-400">
                      {Number(row.nominations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
