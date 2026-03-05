import { ATT, PAY, TRACKING_START_DATE } from './constants';
import { parseMoney, parseDate } from './utils';
import type { AppData, FinancialLedger, HealthStatus, TimelineEvent, SessionEntry } from './types';

export function calculateFinancialLedger(userName: string, data: AppData): FinancialLedger {
  const { attendance, payments } = data;

  const costEvents: TimelineEvent[] = attendance
    .filter((r) => r[ATT.NAME] === userName)
    .map((r) => ({
      date: parseDate(r[ATT.DATE])!,
      dateStr: r[ATT.DATE] || '',
      location: r[ATT.LOCATION] || '',
      month: r[ATT.MONTH] || '',
      type: 'cost' as const,
      amount: parseMoney(r[ATT.COST]),
      cumulativeCost: 0,
      cumulativePaid: 0,
    }))
    .filter((r) => r.date && r.date >= TRACKING_START_DATE);

  const payEvents: TimelineEvent[] = payments
    .filter((r) => r[PAY.NAME] === userName)
    .map((r) => ({
      date: parseDate(r[PAY.DATE])!,
      dateStr: r[PAY.DATE] || '',
      type: 'payment' as const,
      amount: parseMoney(r[PAY.AMOUNT]),
      reference: r[PAY.REFERENCE] || '',
      cumulativeCost: 0,
      cumulativePaid: 0,
    }))
    .filter((r) => r.date && r.amount > 0 && r.date >= TRACKING_START_DATE);

  const timeline: TimelineEvent[] = [...costEvents, ...payEvents].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  let cumCost = 0;
  let cumPaid = 0;
  timeline.forEach((e) => {
    if (e.type === 'cost') cumCost += e.amount;
    else cumPaid += e.amount;
    e.cumulativeCost = cumCost;
    e.cumulativePaid = cumPaid;
  });

  // FIFO status on cost events only, using total paid
  const totalPaid = cumPaid;
  const sessions: SessionEntry[] = costEvents
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((s) => ({
      date: s.date,
      dateStr: s.dateStr,
      location: s.location || '',
      month: s.month || '',
      amount: s.amount,
      status: 'unpaid' as const,
      cumulativeCost: 0,
    }));

  let runningCost = 0;
  sessions.forEach((s) => {
    const prev = runningCost;
    runningCost += s.amount;
    s.cumulativeCost = runningCost;
    if (runningCost <= totalPaid) s.status = 'paid';
    else if (prev < totalPaid) s.status = 'partial';
    else s.status = 'unpaid';
  });

  const unpaidCount = sessions.filter((s) => s.status === 'unpaid').length;
  const partialCount = sessions.filter((s) => s.status === 'partial').length;

  return {
    timeline,
    sessions,
    totalPaid,
    cumulativeCost: cumCost,
    cumulativePaid: cumPaid,
    unpaidCount,
    partialCount,
    pendingCount: unpaidCount + partialCount,
  };
}

export function getHealthStatus(ledger: FinancialLedger): HealthStatus {
  if (ledger.sessions.length === 0) return 'caught-up';
  if (ledger.pendingCount === 0) {
    if (ledger.totalPaid > ledger.cumulativeCost) return 'prepaid';
    return 'caught-up';
  }
  return 'pending';
}
