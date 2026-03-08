'use client';

import { useState } from 'react';
import Badge from '@/app/_components/Badge';
import Button from '@/app/_components/Button';
import { SUM } from '../_lib/constants';
import { parseMoney, fmtMoney, parseDate } from '../_lib/utils';
import { calculateFinancialLedger } from '../_lib/ledger';
import type { AppData, RawRow, SortState } from '../_lib/types';

type StatusFilter = 'all' | 'pending' | 'prepaid' | 'balanced';

interface Props {
  data: AppData;
  onSelectPlayer: (name: string) => void;
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function MasterLedger({ data, onSelectPlayer }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showNeverPaid, setShowNeverPaid] = useState(false);
  const [showOneSession, setShowOneSession] = useState(false);
  const [coveredYearFilter, setCoveredYearFilter] = useState('all');
  const [lastPaymentYearFilter, setLastPaymentYearFilter] = useState('all');
  const [lastPaymentMonthFilter, setLastPaymentMonthFilter] = useState('all');
  const [sort, setSort] = useState<SortState>({ col: null, asc: true });
  const [copiedName, setCopiedName] = useState<string | null>(null);

  // Derive available filter options
  const coveredYears = [...new Set(
    data.summary
      .map((r) => parseDate(r[SUM.COVERED_UNTIL]))
      .filter((d): d is Date => d !== null)
      .map((d) => d.getFullYear())
  )].sort((a, b) => b - a);

  const paymentYears = [...new Set(
    data.summary
      .map((r) => parseDate(r[SUM.LAST_PAID_DATE]))
      .filter((d): d is Date => d !== null)
      .map((d) => d.getFullYear())
  )].sort((a, b) => b - a);

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  function handleSort(col: string) {
    setSort((prev) => prev.col === col ? { col, asc: !prev.asc } : { col, asc: true });
  }

  let rows = data.summary.filter((r) => {
    const pend = parseMoney(r[SUM.PENDING]);
    const pre = parseMoney(r[SUM.PREPAY]);

    if (statusFilter === 'pending') {
      if (pend <= 0) return false;
      if (showNeverPaid) {
        const covered = r[SUM.COVERED_UNTIL];
        if (covered && covered !== '-' && covered.trim() !== '') return false;
      }
      if (showOneSession) {
        const ledger = calculateFinancialLedger(r[SUM.NAME], data);
        const unpaid = ledger.sessions.filter((s) => s.status === 'unpaid' || s.status === 'partial');
        if (unpaid.length !== 1) return false;
      }
      if (coveredYearFilter !== 'all') {
        const d = parseDate(r[SUM.COVERED_UNTIL]);
        if (!d || d.getFullYear().toString() !== coveredYearFilter) return false;
      }
      if (lastPaymentYearFilter !== 'all') {
        const d = parseDate(r[SUM.LAST_PAID_DATE]);
        if (!d || d.getFullYear().toString() !== lastPaymentYearFilter) return false;
      }
      if (lastPaymentMonthFilter !== 'all') {
        const d = parseDate(r[SUM.LAST_PAID_DATE]);
        if (!d || d.getMonth().toString() !== lastPaymentMonthFilter) return false;
      }
      return true;
    }
    if (statusFilter === 'prepaid') return pre > 0;
    if (statusFilter === 'balanced') return Math.abs(pre - pend) < 0.01;
    return true;
  });

  // Sort
  if (sort.col) {
    rows = [...rows].sort((a, b) => {
      let valA: number | string, valB: number | string;
      switch (sort.col) {
        case 'name': valA = (a[SUM.NAME] || '').toLowerCase(); valB = (b[SUM.NAME] || '').toLowerCase(); break;
        case 'pending': valA = parseMoney(a[SUM.PENDING]); valB = parseMoney(b[SUM.PENDING]); break;
        case 'prepay': valA = parseMoney(a[SUM.PREPAY]); valB = parseMoney(b[SUM.PREPAY]); break;
        case 'total': valA = parseMoney(a[SUM.TOTAL]); valB = parseMoney(b[SUM.TOTAL]); break;
        case 'covered': valA = (parseDate(a[SUM.COVERED_UNTIL]) || new Date(0)).getTime(); valB = (parseDate(b[SUM.COVERED_UNTIL]) || new Date(0)).getTime(); break;
        default: valA = 0; valB = 0;
      }
      if (sort.asc) return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }

  const tPending = rows.reduce((s, r) => s + parseMoney(r[SUM.PENDING]), 0);
  const tPrepay = rows.reduce((s, r) => s + parseMoney(r[SUM.PREPAY]), 0);
  const tPaid = rows.reduce((s, r) => s + parseMoney(r[SUM.TOTAL]), 0);

  async function copyMessage(r: RawRow) {
    const name = r[SUM.NAME];
    const pend = parseMoney(r[SUM.PENDING]);
    const coveredUntil = r[SUM.COVERED_UNTIL] || 'your last session';
    const link = `${window.location.origin}${window.location.pathname}?user=${encodeURIComponent(name)}`;
    const msg = `Hey ${name}, you have unpaid Frisbee field booking fees of ${pend.toFixed(2)} MVR pending since ${coveredUntil}.\nYou can view the session cost details at: ${link}\n\nPlease pay to the following account: 7730000682000 (MOHD. AMSAL)`;
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2000);
    } catch {
      // clipboard not available
    }
  }

  const thClass = 'px-3 py-3 text-left text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap cursor-pointer select-none hover:text-[var(--accent)] transition-colors';

  function SortIndicator({ col }: { col: string }) {
    if (sort.col !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-[var(--accent)] ml-1">{sort.asc ? '↑' : '↓'}</span>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-[var(--text-primary)]">Master Ledger</h3>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'prepaid', 'balanced'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`min-h-[44px] px-4 rounded-lg text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] cursor-pointer ${
              statusFilter === s
                ? 'bg-[var(--accent)] text-white'
                : 'border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Pending sub-filters */}
      {statusFilter === 'pending' && (
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={showNeverPaid}
              onChange={(e) => setShowNeverPaid(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)]"
            />
            Never paid
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={showOneSession}
              onChange={(e) => setShowOneSession(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)]"
            />
            One session only
          </label>

          <select
            value={coveredYearFilter}
            onChange={(e) => setCoveredYearFilter(e.target.value)}
            className="text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
          >
            <option value="all">Covered Year: All</option>
            {coveredYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            value={lastPaymentYearFilter}
            onChange={(e) => setLastPaymentYearFilter(e.target.value)}
            className="text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
          >
            <option value="all">Last Paid Year: All</option>
            {paymentYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            value={lastPaymentMonthFilter}
            onChange={(e) => setLastPaymentMonthFilter(e.target.value)}
            className="text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
          >
            <option value="all">Last Paid Month: All</option>
            {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-[var(--border)]">
        <table className="w-full min-w-max text-sm text-left">
          <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)] sticky top-0 z-10">
            <tr>
              <th className={thClass} onClick={() => handleSort('name')}>Name <SortIndicator col="name" /></th>
              <th className={thClass} onClick={() => handleSort('pending')}>Pending <SortIndicator col="pending" /></th>
              <th className={thClass} onClick={() => handleSort('prepay')}>Prepaid <SortIndicator col="prepay" /></th>
              <th className={thClass} onClick={() => handleSort('total')}>Total Paid <SortIndicator col="total" /></th>
              <th className={thClass} onClick={() => handleSort('covered')}>Covered Until <SortIndicator col="covered" /></th>
              <th className="px-3 py-3 text-xs font-semibold text-[var(--text-primary)]">Status</th>
              <th className="px-3 py-3 text-xs font-semibold text-[var(--text-primary)]">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                  No players match the current filters.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const pend = parseMoney(r[SUM.PENDING]);
                const pre = parseMoney(r[SUM.PREPAY]);
                const tot = parseMoney(r[SUM.TOTAL]);
                const name = r[SUM.NAME];
                const badgeVariant = pend > 0 ? 'unpaid' : pre > 0 ? 'paid' : 'paid';
                const badgeLabel = pend > 0 ? 'Unpaid' : pre > 0 ? 'Prepaid' : 'Paid';

                return (
                  <tr
                    key={name}
                    className={`border-t border-[var(--border)] ${i % 2 === 1 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-page)]'}`}
                  >
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => onSelectPlayer(name)}
                        className="text-[var(--accent)] hover:underline text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] rounded cursor-pointer"
                      >
                        {name}
                      </button>
                    </td>
                    <td className={`px-3 py-3 text-sm font-medium ${pend > 0 ? 'text-red-600' : 'text-[var(--text-muted)]'}`}>
                      {fmtMoney(pend)}
                    </td>
                    <td className={`px-3 py-3 text-sm font-medium ${pre > 0 ? 'text-green-600' : 'text-[var(--text-muted)]'}`}>
                      {fmtMoney(pre)}
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-[var(--text-primary)]">
                      {fmtMoney(tot)}
                    </td>
                    <td className="px-3 py-3 text-sm text-[var(--text-muted)]">
                      {r[SUM.COVERED_UNTIL] || '-'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      {pend > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(r)}
                          icon={<CopyIcon />}
                          aria-label={`Copy reminder for ${name}`}
                        >
                          {copiedName === name ? '✓ Copied' : 'Copy'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="border-t-2 border-[var(--border)] bg-[var(--bg-surface)] font-bold">
              <tr>
                <td className="px-3 py-3 text-[var(--text-primary)] text-sm">Totals ({rows.length})</td>
                <td className="px-3 py-3 text-red-600 text-sm">{fmtMoney(tPending)}</td>
                <td className="px-3 py-3 text-green-600 text-sm">{fmtMoney(tPrepay)}</td>
                <td className="px-3 py-3 text-[var(--text-primary)] text-sm">{fmtMoney(tPaid)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
