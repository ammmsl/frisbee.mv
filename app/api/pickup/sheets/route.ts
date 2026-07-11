import { NextResponse } from 'next/server';
import { getCachedSheets, sheetsConfigured } from '@/lib/pickup-sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!sheetsConfigured()) {
    console.warn('SHEETS_API_KEY / SHEET_ID not set — pickup sheets route disabled');
    return NextResponse.json({ error: 'Could not load payment data' }, { status: 502 });
  }

  try {
    const appData = await getCachedSheets();
    return NextResponse.json(appData);
  } catch (e) {
    console.error('GET /api/pickup/sheets error:', e);
    return NextResponse.json({ error: 'Could not load payment data' }, { status: 502 });
  }
}
