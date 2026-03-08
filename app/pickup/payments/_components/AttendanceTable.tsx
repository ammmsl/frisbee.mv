'use client';

import { useState } from 'react';
import Badge from '@/app/_components/Badge';
import { ATT, MONTH_ORDER } from '../_lib/constants';
import { parseDate, parseMoney, fmtMoney, formatMembershipLabel } from '../_lib/utils';
import type { RawRow, SortState } from '../_lib/types';

interface Props {
  attRows: RawRow[];
  months: string[];
  years: string[];
  locations: string[];
}

type SortCol = 'date' | 'month' | 'location' | 'cost' | 'status';

function MembershipBadge({ row }: { row: RawRow }) {
  const label = formatMembershipLabel(row);
  const variant =
    label === 'Pre-UFA' ? 'past' : label === 'Non-Member' ? 'unpaid' : 'paid';
  return <Badge variant={variant}>{label}</Badge>;
}

export default function AttendanceTable({ attRows, months, years, locations }: Props) {
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sort, setSort] = useState<SortState>({ col: 'date', asc: false });

  function handleSort(col: SortCol) {
    setSort((prev) =>
      prev.col === col ? { col, asc: !prev.asc } : { col, asc: true }
    );
  }

  let rows = attRows.filter((r) => {
    if (monthFilter !== 'all' && r[ATT.MONTH] !== monthFilter) return false;
    if (yearFilter !== 'all' && !(r[ATT.DATE] || '').includes(yearFilter)) return false;
    if (locationFilter !== 'all' && r[ATT.LOCATION] !== locationFilter) return false;
    return true;
  });

  rows = [...rows].sort((a, b) => {
    let valA: number | string, valB: number | string;
    switch (sort.col as SortCol) {
      case 'date':
        valA = (parseDate(a[ATT.DATE]) || new Date(0)).getTime();
        valB = (parseDate(b[ATT.DATE]) || new Date(0)).getTime();
        break;
      case 'month':
        valA = MONTH_ORDER[(a[ATT.MONTH] || '').toLowerCase()] ?? 99;
        valB = MONTH_ORDER[(b[ATT.MONTH] || '').toLowerCase()] ?? 99;
        break;
      case 'location':
        valA = (a[ATT.LOCATION] || '').toLowerCase();
        valB = (b[ATT.LOCATION] || '').toLowerCase();
        break;
      case 'cost':
        valA = parseMoney(a[ATT.COST]);
        valB = parseMoney(b[ATT.COST]);
        break;
      case 'status':
        valA = (a[ATT.MEMBERSHIP] || '').toLowerCase();
        valB = (b[ATT.MEMBERSHIP] || '').toLowerCase();
        break;
      default:
        valA = 0;
        valB = 0;
    }
    if (sort.asc) return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const thClass =
    'px-3 py-3 text-left text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap cursor-pointer select-none hover:text-[var(--accent)] transition-colors';

  function SortIndicator({ col }: { col: SortCol }) {
    if (sort.col !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-[var(--accent)] ml-1">{sort.asc ? '↑' : '↓'}</span>;
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
        >
          <option value="all">All Months</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
        >
          <option value="all">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
        >
          <option value="all">All Locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-[var(--border)]">
        <table className="w-full min-w-max text-sm text-left">
          <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)] sticky top-0 z-10">
            <tr>
              <th className={thClass} onClick={() => handleSort('date')}>
                Date <SortIndicator col="date" />
              </th>
              <th className={thClass} onClick={() => handleSort('location')}>
                Location <SortIndicator col="location" />
              </th>
              <th className={thClass} onClick={() => handleSort('month')}>
                Month <SortIndicator col="month" />
              </th>
              <th className={thClass} onClick={() => handleSort('cost')}>
                Cost <SortIndicator col="cost" />
              </th>
              <th className={thClass} onClick={() => handleSort('status')}>
                Membership <SortIndicator col="status" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={i}
                  className={
                    i % 2 === 1
                      ? 'bg-[var(--bg-surface)] border-t border-[var(--border)]'
                      : 'bg-[var(--bg-page)] border-t border-[var(--border)]'
                  }
                >
                  <td className="px-3 py-3 text-[var(--text-primary)] font-mono text-xs whitespace-nowrap">
                    {r[ATT.DATE]}
                  </td>
                  <td className="px-3 py-3 text-[var(--text-primary)]">{r[ATT.LOCATION]}</td>
                  <td className="px-3 py-3 text-[var(--text-muted)]">{r[ATT.MONTH]}</td>
                  <td className="px-3 py-3 text-[var(--text-primary)] whitespace-nowrap">
                    {fmtMoney(parseMoney(r[ATT.COST]))}
                  </td>
                  <td className="px-3 py-3">
                    <MembershipBadge row={r} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <p className="text-xs text-[var(--text-muted)] text-right">
          {rows.length} record{rows.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
