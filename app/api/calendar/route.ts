import { NextRequest, NextResponse } from 'next/server'
import { getCalendarDays } from '@/lib/calendar'

export const dynamic = 'force-dynamic'

// Re-export for backward compatibility (CalendarWidget imports this type from here)
export type { CalendarDay } from '@/lib/calendar'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: 'month parameter required (format: YYYY-MM)' },
      { status: 400 }
    )
  }

  const result = await getCalendarDays(month)
  return NextResponse.json(result)
}
