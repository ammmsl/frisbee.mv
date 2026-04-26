import postgres from 'postgres'

const sql = postgres(process.env.LEAGUE_DATABASE_URL ?? process.env.DATABASE_URL!, {
  max: 1,
  ssl: 'require',
  prepare: false,
  connect_timeout: 5,
})

export default sql
