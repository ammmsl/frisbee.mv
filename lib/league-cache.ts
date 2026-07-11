import { revalidateTag } from 'next/cache'

/** Flush every cached league query. Call after ANY league DB write. */
export function invalidateLeagueCache() {
  revalidateTag('league', 'max')
}
