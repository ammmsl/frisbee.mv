import postgres from 'postgres'

// During `next build`, skip all DB connections — pages render empty state via try/catch,
// then ISR regenerates them on the first admin write after deploy.
const isBuildPhase = process.env.LEAGUE_BUILD_PHASE === '1'

const sql = isBuildPhase
  ? ((..._: unknown[]) => Promise.reject(new Error('Build: no DB'))) as unknown as ReturnType<typeof postgres>
  : postgres(process.env.LEAGUE_DATABASE_URL ?? process.env.DATABASE_URL!, {
      max: 1,
      ssl: 'require',
      prepare: false,
      connect_timeout: 5,
    })

export default sql
