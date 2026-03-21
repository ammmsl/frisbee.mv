import postgres from 'postgres'

// Uses LEAGUE_DATABASE_URL if set; falls back to DATABASE_URL if both apps share the same Supabase project.
const sql = postgres(process.env.LEAGUE_DATABASE_URL ?? process.env.DATABASE_URL!, {
  max: 1,
  ssl: 'require',
  prepare: false,
})

export default sql
