import {
  getActiveSeason,
  getGoals,
  getAssists,
  getBlocks,
  getAppearances,
  getMatchweekHistory,
  type StatRow,
  type MatchweekRow,
} from '@/lib/league-queries'
import PublicNav from '../_components/PublicNav'
import StatsClient from './StatsClient'

export const dynamic = 'force-dynamic'

export type { StatRow, MatchweekRow }

export type StatsClientProps = {
  seasonName:  string
  goals:       StatRow[]
  assists:     StatRow[]
  blocks:      StatRow[]
  appearances: StatRow[]
  history:     MatchweekRow[]
}

export default async function StatsPage() {
  let season = null
  try { season = await getActiveSeason() } catch {}

  if (!season) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <PublicNav />
        <div className="max-w-lg mx-auto px-4 pb-16 pt-6">
          <h1 className="text-2xl font-bold mb-1">Stats</h1>
          <p className="text-gray-400 text-sm">No active season.</p>
        </div>
      </div>
    )
  }

  const seasonId = season.season_id as string

  const data = await Promise.all([
    getGoals(seasonId),
    getAssists(seasonId),
    getBlocks(seasonId),
    getAppearances(seasonId),
    getMatchweekHistory(seasonId),
  ]).catch(() => null)

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <PublicNav />
        <div className="max-w-lg mx-auto px-4 pb-16 pt-6">
          <h1 className="text-2xl font-bold mb-1">Stats</h1>
          <p className="text-gray-400 text-sm">No active season.</p>
        </div>
      </div>
    )
  }

  const [goals, assists, blocks, appearances, history] = data

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNav />
      <StatsClient
        seasonName={season.season_name as string}
        goals={goals}
        assists={assists}
        blocks={blocks}
        appearances={appearances}
        history={history}
      />
    </div>
  )
}
