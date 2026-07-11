import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/league-db'
import { invalidateLeagueCache } from '@/lib/league-cache'
import { getAdminSession } from '@/lib/league-auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ holidayId: string }> }
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { holidayId } = await params

  try {
    const result = await sql`
      DELETE FROM season_holidays
      WHERE holiday_id = ${holidayId}
      RETURNING holiday_id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Holiday not found' },
        { status: 404 }
      )
    }

    invalidateLeagueCache()
    return NextResponse.json({ deleted: result[0].holiday_id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
