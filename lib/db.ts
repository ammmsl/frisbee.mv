import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Configure it in .env.local with your Supabase ' +
    'connection pooler URL (port 6543, pgBouncer).'
  )
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: 'require',
  prepare: false,
})

export default sql
