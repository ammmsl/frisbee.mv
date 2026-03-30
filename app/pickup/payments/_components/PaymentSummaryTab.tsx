'use client';

import Image from 'next/image';
import Badge from '@/app/_components/Badge';
import FinancialBurnUpChart from './FinancialBurnUpChart';
import SessionStatusCards from './SessionStatusCards';
import { SUM, PAYMENT_ACCOUNT } from '../_lib/constants';
import { parseMoney, fmtMoney } from '../_lib/utils';
import CopyableValue from './CopyableValue';
import { getHealthStatus } from '../_lib/ledger';
import type { FinancialLedger, RawRow } from '../_lib/types';

interface Props {
  summaryRow: RawRow | undefined;
  ledger: FinancialLedger;
  attRows: RawRow[];
  onShowQR: () => void;
}

export default function PaymentSummaryTab({ summaryRow, ledger, attRows, onShowQR }: Props) {
  const pending = summaryRow ? parseMoney(summaryRow[SUM.PENDING]) : 0;
  const prepay = summaryRow ? parseMoney(summaryRow[SUM.PREPAY]) : 0;
  const total = summaryRow ? parseMoney(summaryRow[SUM.TOTAL]) : 0;
  const lastPaidDate = summaryRow?.[SUM.LAST_PAID_DATE] || '-';
  const lastPaidAmt = summaryRow?.[SUM.LAST_PAID_AMT]
    ? fmtMoney(parseMoney(summaryRow[SUM.LAST_PAID_AMT]))
    : '-';
  const coveredUntil = summaryRow?.[SUM.COVERED_UNTIL] || '-';

  const healthStatus = getHealthStatus(ledger);
  const healthBadgeVariant =
    healthStatus === 'pending' ? 'unpaid' : healthStatus === 'prepaid' ? 'paid' : 'paid';
  const healthLabel =
    healthStatus === 'pending'
      ? ledger.pendingCount === 1
        ? '1 Session Pending'
        : `${ledger.pendingCount} Sessions Pending`
      : healthStatus === 'prepaid'
      ? 'Status: Prepaid'
      : 'Status: Caught Up';

  const paidSessions = attRows.filter((r) => parseMoney(r[4]) > 0);
  const totalCost = paidSessions.reduce((acc, r) => acc + parseMoney(r[4]), 0);
  const avgCost = paidSessions.length ? Math.round(totalCost / paidSessions.length) : 0;

  return (
    <div className="space-y-6">
      {/* Health badge */}
      {ledger.sessions.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant={healthBadgeVariant}>{healthLabel}</Badge>
        </div>
      )}

      {/* Pending alert */}
      {pending > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <button
            type="button"
            onClick={onShowQR}
            className="shrink-0 cursor-pointer rounded-lg overflow-hidden border border-[var(--border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            aria-label="View payment QR code"
          >
            <Image
              src="/payment_qr.png"
              alt="Scan to pay"
              width={80}
              height={80}
              className="block"
            />
            <p className="text-[10px] text-[var(--text-muted)] text-center py-0.5 bg-white">
              Click to enlarge
            </p>
          </button>
          <div>
            <p className="font-semibold text-red-700 text-sm">
              Outstanding Balance:{' '}
              <CopyableValue
                value={String(pending)}
                display={<span className="font-semibold text-red-700">{fmtMoney(pending)}</span>}
                label={`Copy pending amount: ${pending} MVR`}
              />
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Transfer to:{' '}
              <CopyableValue
                value={PAYMENT_ACCOUNT}
                display={<span className="font-mono font-medium text-[var(--text-primary)]">{PAYMENT_ACCOUNT}</span>}
                label={`Copy account number: ${PAYMENT_ACCOUNT}`}
              />{' '}
              (MOHD. AMSAL)
            </p>
          </div>
        </div>
      )}

      {/* Summary stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center">
          <p className={`text-xl font-bold ${pending > 0 ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
            {fmtMoney(pending)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Pending</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center">
          <p className={`text-xl font-bold ${prepay > 0 ? 'text-green-600' : 'text-[var(--text-primary)]'}`}>
            {fmtMoney(prepay)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Prepaid</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center">
          <p className="text-xl font-bold text-[var(--text-primary)]">{fmtMoney(total)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Total Paid</p>
        </div>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-[var(--text-muted)] text-xs">Total Sessions</p>
          <p className="font-semibold text-[var(--text-primary)]">{attRows.length}</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)] text-xs">Avg Cost</p>
          <p className="font-semibold text-[var(--text-primary)]">{avgCost} MVR</p>
        </div>
        <div>
          <p className="text-[var(--text-muted)] text-xs">Last Paid</p>
          <p className="font-semibold text-[var(--text-primary)]">{lastPaidDate}</p>
          {lastPaidAmt !== '-' && (
            <p className="text-xs text-[var(--text-muted)]">{lastPaidAmt}</p>
          )}
        </div>
        <div>
          <p className="text-[var(--text-muted)] text-xs">Covered Until</p>
          <p className="font-semibold text-[var(--text-primary)]">{coveredUntil}</p>
        </div>
      </div>

      {/* Financial chart */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Cumulative Cost vs Payments
        </h3>
        <FinancialBurnUpChart ledger={ledger} />
      </div>

      {/* Session status cards */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Recent Session Status (FIFO)
        </h3>
        <SessionStatusCards sessions={ledger.sessions} />
      </div>
    </div>
  );
}
