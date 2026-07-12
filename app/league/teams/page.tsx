import Link from 'next/link'
import { getActiveSeason, getTeamsWithStats } from '@/lib/league-queries'
import PublicNav from '../_components/PublicNav'
import { TeamAvatar } from '../_components/Avatar'

export const dynamic = 'force-dynamic'

export default async function TeamsPage() {
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

  const teams = await getTeamsWithStats(season.season_id as string).catch(() => [])

  return (
    <div className="page-shell">
      <PublicNav />
      <div className="page-container">
        <h1 className="page-heading mb-6">Teams</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((t) => {
            const won   = Number(t.won)
            const drawn = Number(t.drawn)
            const lost  = Number(t.lost)
            const pts   = Number(t.points)
            const played = won + drawn + lost
            return (
              <Link
                key={t.team_id as string}
                href={`/league/team/${t.team_id as string}`}
                className="card-link"
              >
                <div className="flex items-center gap-3 mb-2">
                  <TeamAvatar id={t.team_id as string} name={t.team_name as string} size={48} />
                  <h2 className="text-lg font-bold">{t.team_name as string}</h2>
                </div>
                <p className="text-sm text-gray-400">
                  {Number(t.player_count)} players
                  {played > 0 && (
                    <> · <span className="text-green-400 font-medium">{pts} pts</span> ({won}W {drawn}D {lost}L)</>
                  )}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
