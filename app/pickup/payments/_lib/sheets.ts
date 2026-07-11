import type { AppData } from './types';

export async function fetchAllSheets(): Promise<AppData> {
  const res = await fetch('/api/pickup/sheets');
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
