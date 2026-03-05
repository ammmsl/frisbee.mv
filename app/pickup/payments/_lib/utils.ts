import { ATT, SHORT_MONTHS } from './constants';
import type { RawRow, MembershipStatus } from './types';

export function parseMoney(str: string | undefined | null): number {
  if (!str) return 0;
  const n = parseFloat(String(str).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

export function fmtMoney(amt: number): string {
  return `${(amt || 0).toFixed(2)} MVR`;
}

export function parseDate(str: string | undefined | null): Date | null {
  if (!str || typeof str !== 'string') return null;

  const parts = str.trim().split('/');
  if (parts.length !== 3) return null;

  const [d, m, y] = parts.map((p) => parseInt(p, 10));
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;

  const date = new Date(y, m - 1, d);
  // Validate the date is real (catches invalid dates like 32/13/2024)
  if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) {
    return null;
  }

  return date;
}

export function fmtDateShort(d: Date): string {
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

export function getMembershipStatus(row: RawRow): MembershipStatus {
  const yr = (parseDate(row[ATT.DATE]) || new Date(0)).getFullYear();
  const raw = (row[ATT.MEMBERSHIP] || '').trim();
  const isError = !raw || raw.startsWith('#');

  if (yr < 2025) {
    if (isError || raw === 'Non-Member') return 'Pre-UFA';
    return 'Member';
  }
  if (raw === 'Non-Member') return 'Non-Member';
  return 'Member';
}

export function formatMembershipLabel(row: RawRow): string {
  const yr = (parseDate(row[ATT.DATE]) || new Date(0)).getFullYear();
  const raw = (row[ATT.MEMBERSHIP] || '').trim();
  const isError = !raw || raw.startsWith('#');

  if (yr < 2025) {
    if (isError || raw === 'Non-Member') return 'Pre-UFA';
    return raw;
  }
  if (raw === 'Non-Member') return 'Non-Member';
  return isError ? 'Member' : raw;
}
