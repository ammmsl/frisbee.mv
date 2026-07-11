import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { ATT, SUM, SESSION, SHEETS_BASE_URL } from '@/app/pickup/payments/_lib/constants';
import type { AppData, RawRow } from '@/app/pickup/payments/_lib/types';

export const dynamic = 'force-dynamic';

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<{ values?: RawRow[] }> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`Fetch attempt ${i + 1} failed, retrying in ${delay * (i + 1)}ms...`);
      await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error('All fetch attempts failed');
}

async function fetchAllSheets(): Promise<AppData> {
  const API_KEY = process.env.SHEETS_API_KEY!;
  const SHEET_ID = process.env.SHEET_ID!;
  const base = `${SHEETS_BASE_URL}/${SHEET_ID}/values`;
  const key = `key=${API_KEY}`;

  const [summaryRes, attendanceRes, paymentsRes, sessionInputRes] = await Promise.all([
    fetchWithRetry(`${base}/Summary%20Sheet?${key}`),
    fetchWithRetry(`${base}/PivotAttendance?${key}`),
    fetchWithRetry(`${base}/Payments?${key}`),
    fetchWithRetry(`${base}/Session%20Input?${key}`),
  ]);

  if (!summaryRes.values || summaryRes.values.length < 2) {
    throw new Error('Invalid or empty summary data from Google Sheets');
  }
  if (!attendanceRes.values || attendanceRes.values.length < 2) {
    throw new Error('Invalid or empty attendance data from Google Sheets');
  }

  const summary = summaryRes.values.slice(1).filter((r) => r?.length > 0 && r[SUM.NAME]);
  const attendance = attendanceRes.values.slice(1).filter((r) => r?.length > 0 && r[ATT.NAME]);
  const payments = (paymentsRes.values ?? []).slice(1).filter((r) => r?.length > 0);
  const sessionInput = (sessionInputRes.values ?? []).slice(1).filter(
    (r) => r?.length > 0 && r[SESSION.DATE]
  );

  if (summary.length === 0 || attendance.length === 0) {
    throw new Error(`No valid data found. Summary: ${summary.length} rows, Attendance: ${attendance.length} rows`);
  }

  const users = [...new Set(summary.map((r) => r[SUM.NAME]))].filter(Boolean).sort();

  const years = [
    ...new Set(
      attendance.map((r) => {
        const parts = (r[ATT.DATE] || '').split('/');
        return parts.length === 3 ? parts[2] : null;
      })
    ),
  ]
    .filter((y): y is string => Boolean(y))
    .sort((a, b) => Number(b) - Number(a));

  return { summary, attendance, payments, sessionInput, users, years };
}

const getCachedSheets = unstable_cache(fetchAllSheets, ['pickup-sheets'], { revalidate: 300 });

export async function GET() {
  if (!process.env.SHEETS_API_KEY || !process.env.SHEET_ID) {
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
