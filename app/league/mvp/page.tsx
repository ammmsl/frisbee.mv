import {
  getActiveSeason,
  getMvpScores,
  getMvpHistory,
  type MvpRow,
  type MvpHistoryRow,
} from '@/lib/league-queries'
import PublicNav from '../_components/PublicNav'
import MvpClient from './MvpClient'

export const dynamic = 'force-dynamic'

export type { MvpRow, MvpHistoryRow }

export type MvpClientProps = {
  seasonName: string
  rows:       MvpRow[]
  history:    MvpHistoryRow[]
}

export default async function MvpPage() {
  let season = null
  try { season = await getActiveSeason() } catch {}

  if (!season) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <PublicNav />
        <div className="max-w-lg mx-auto px-4 pb-16 pt-6">
          <h1 className="text-2xl font-bold mb-1">MVP Race</h1>
          <p className="text-gray-400 text-sm">No active season.</p>
        </div>
      </div>
    )
  }

  const seasonId = season.season_id as string

  const data = await Promise.all([
    getMvpScores(seasonId),
    getMvpHistory(seasonId),
  ]).catch(() => null)

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <PublicNav />
        <div className="max-w-lg mx-auto px-4 pb-16 pt-6">
          <h1 className="text-2xl font-bold mb-1">MVP Race</h1>
          <p className="text-gray-400 text-sm">No active season.</p>
        </div>
      </div>
    )
  }

  const [rows, history] = data

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNav />
      <MvpClient
        seasonName={season.season_name as string}
        rows={rows}
        history={history}
      />
    </div>
  )
}
