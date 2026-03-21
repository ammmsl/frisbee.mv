import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | null = null

function getClient(): ReturnType<typeof postgres> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Configure it in .env.local with your Supabase ' +
        'connection pooler URL (port 6543, pgBouncer).'
      )
    }
    _sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: 'require',
      prepare: false,
    })
  }
  return _sql
}

// Proxy defers client creation to first query — safe to import without DATABASE_URL
const sql = new Proxy(
  function () {} as unknown as ReturnType<typeof postgres>,
  {
    apply(_target, _thisArg, args) {
      return (getClient() as unknown as (...a: unknown[]) => unknown)(...args)
    },
    get(_target, prop) {
      return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
    },
  }
)

export default sql
