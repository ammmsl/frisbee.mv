import { ATT, PAY, SUM, SESSION, TRACKING_START_DATE, SESSION_COST, SHORT_MONTHS } from './constants';
import { parseMoney, parseDate } from './utils';
import { calculateFinancialLedger } from './ledger';
import type {
  AppData,
  AdminMetrics,
  RevenueChartData,
  VelocityChartData,
  RetentionChartData,
  TimePeriod,
  Binning,
  YearlyData,
} from './types';

// Helper: generate time buckets for chart data
function generateBuckets(
  timePeriod: TimePeriod | string,
  binning: Binning,
  allDates: Date[],
  now: Date
): { start: Date; end: Date; label: string }[] {
  let startDate: Date;
  if (timePeriod === 'all') {
    const sorted = [...allDates].sort((a, b) => a.getTime() - b.getTime());
    startDate = sorted.length > 0 ? sorted[0] : new Date();
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(String(timePeriod)));
  }

  const buckets: { start: Date; end: Date; label: string }[] = [];

  if (binning === 'daily') {
    const cur = new Date(startDate);
    while (cur <= now) {
      buckets.push({
        start: new Date(cur),
        end: new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 23, 59, 59),
        label: `${cur.getDate()}/${cur.getMonth() + 1}`,
      });
      cur.setDate(cur.getDate() + 1);
    }
  } else if (binning === 'weekly') {
    const cur = new Date(startDate);
    while (cur <= now) {
      const weekEnd = new Date(cur);
      weekEnd.setDate(weekEnd.getDate() + 6);
      buckets.push({
        start: new Date(cur),
        end: weekEnd > now ? now : weekEnd,
        label: `${cur.getDate()}/${cur.getMonth() + 1}`,
      });
      cur.setDate(cur.getDate() + 7);
    }
  } else {
    // monthly
    const cur = new Date(startDate);
    while (cur <= now) {
      const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0, 23, 59, 59);
      buckets.push({
        start: new Date(cur),
        end: monthEnd > now ? now : monthEnd,
        label: `${SHORT_MONTHS[cur.getMonth()]} ${String(cur.getFullYear()).slice(2)}`,
      });
      cur.setMonth(cur.getMonth() + 1);
      cur.setDate(1);
    }
  }

  return buckets;
}

export function calculateAdminMetrics(
  data: AppData,
  timePeriod: TimePeriod | string = '90',
  binning: Binning = 'weekly'
): AdminMetrics {
  const { summary, attendance, payments, sessionInput, users } = data;

  // 1. Total Outstanding & Prepaid
  const totalPending = summary.reduce((sum, r) => sum + parseMoney(r[SUM.PENDING]), 0);
  const totalPrepaid = summary.reduce((sum, r) => sum + parseMoney(r[SUM.PREPAY]), 0);

  // 2. Revenue & Field Costs
  let totalPlayerPaymentsIn = 0;

  payments.forEach((r) => {
    const amount = parseMoney(r[PAY.AMOUNT]);
    const paymentType = (r[PAY.PREPAYMENT] || '').trim().toLowerCase();
    const paymentDate = parseDate(r[PAY.DATE]);
    if (!paymentDate || paymentDate < TRACKING_START_DATE) return;
    if (paymentType === 'field booking' || paymentType === 'fieldbooking') return;
    totalPlayerPaymentsIn += amount;
  });

  // Field costs from Session Input sheet
  const fieldCostMap: Record<string, number> = {};
  sessionInput.forEach((row) => {
    const date = row[SESSION.DATE];
    const cost = parseMoney(row[SESSION.FIELD_COST]);
    if (date && cost > 0) fieldCostMap[date] = cost;
  });

  const uniqueDates = new Set(
    attendance
      .map((r) => r[ATT.DATE])
      .filter((dateStr) => {
        const d = parseDate(dateStr);
        return d && d >= TRACKING_START_DATE;
      })
  );

  let totalFieldCosts = 0;
  uniqueDates.forEach((dateStr) => {
    totalFieldCosts += fieldCostMap[dateStr] || SESSION_COST;
  });

  const operatingCash = totalPlayerPaymentsIn - totalFieldCosts;

  // 3. Profit from surcharges
  let collectedProfit = 0;
  let pendingProfit = 0;

  users.forEach((userName) => {
    const ledger = calculateFinancialLedger(userName, data);
    ledger.sessions.forEach((session) => {
      const attRecords = attendance.filter(
        (r) => r[ATT.NAME] === userName && r[ATT.DATE] === session.dateStr
      );
      let sessionSurcharge = 0;
      attRecords.forEach((a) => {
        sessionSurcharge += parseMoney(a[ATT.SURCHARGE] || '0');
      });
      if (session.status === 'paid') collectedProfit += sessionSurcharge;
      else pendingProfit += sessionSurcharge;
    });
  });

  // 4. Active Players (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activePlayers = new Set<string>();
  attendance.forEach((r) => {
    const d = parseDate(r[ATT.DATE]);
    if (d && d >= thirtyDaysAgo) activePlayers.add(r[ATT.NAME]);
  });

  // 5. Avg Attendance per Session
  const sessionDates = [...new Set(attendance.map((r) => r[ATT.DATE]))];
  const avgAttendance =
    sessionDates.length > 0 ? (attendance.length / sessionDates.length).toFixed(1) : 0;

  // 6. Retention Rate (last 30 vs previous 30)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const previousPeriodPlayers = new Set<string>();
  attendance.forEach((r) => {
    const d = parseDate(r[ATT.DATE]);
    if (d && d >= sixtyDaysAgo && d < thirtyDaysAgo) previousPeriodPlayers.add(r[ATT.NAME]);
  });

  let retentionRate: number | string = 0;
  if (previousPeriodPlayers.size > 0) {
    const retained = [...previousPeriodPlayers].filter((p) => activePlayers.has(p)).length;
    retentionRate = ((retained / previousPeriodPlayers.size) * 100).toFixed(0);
  }

  // 7. Payment Velocity
  let totalDays = 0;
  let paidSessionCount = 0;
  users.forEach((userName) => {
    const userAttendance = attendance.filter((r) => r[ATT.NAME] === userName);
    const userPayments = payments.filter((r) => r[PAY.NAME] === userName);
    userAttendance.forEach((att) => {
      const attDate = parseDate(att[ATT.DATE]);
      if (!attDate) return;
      const nextPayment = userPayments.find((pay) => {
        const pd = parseDate(pay[PAY.DATE]);
        return pd && pd >= attDate;
      });
      if (nextPayment) {
        const pd = parseDate(nextPayment[PAY.DATE])!;
        totalDays += Math.floor((pd.getTime() - attDate.getTime()) / (1000 * 60 * 60 * 24));
        paidSessionCount++;
      }
    });
  });
  const paymentVelocity = paidSessionCount > 0 ? Math.round(totalDays / paidSessionCount) : 0;

  // 8. Top 10 Debtors
  const topDebtors = summary
    .map((r) => ({ name: r[SUM.NAME], pending: parseMoney(r[SUM.PENDING]) }))
    .filter((d) => d.pending > 0)
    .sort((a, b) => b.pending - a.pending)
    .slice(0, 10);

  // 9. Yearly Financial Data
  const yearlyMap: Record<number, YearlyData & { sessionDates?: Set<string> }> = {};

  payments.forEach((r) => {
    const d = parseDate(r[PAY.DATE]);
    if (!d) return;
    const yr = d.getFullYear();
    const amount = parseMoney(r[PAY.AMOUNT]);
    const payType = (r[PAY.PREPAYMENT] || '').trim().toLowerCase();
    if (payType === 'field booking' || payType === 'fieldbooking') return;
    if (!yearlyMap[yr]) yearlyMap[yr] = { year: yr, revenue: 0, profit: 0, fieldCosts: 0 };
    yearlyMap[yr].revenue += amount;
  });

  attendance.forEach((r) => {
    const d = parseDate(r[ATT.DATE]);
    if (!d) return;
    const yr = d.getFullYear();
    const surcharge = parseMoney(r[ATT.SURCHARGE] || '0');
    if (!yearlyMap[yr]) yearlyMap[yr] = { year: yr, revenue: 0, profit: 0, fieldCosts: 0 };
    yearlyMap[yr].profit += surcharge;

    const dateStr = r[ATT.DATE];
    if (!yearlyMap[yr].sessionDates) yearlyMap[yr].sessionDates = new Set();
    if (!yearlyMap[yr].sessionDates!.has(dateStr)) {
      yearlyMap[yr].sessionDates!.add(dateStr);
      yearlyMap[yr].fieldCosts += fieldCostMap[dateStr] || SESSION_COST;
    }
  });

  const yearlyData: YearlyData[] = Object.values(yearlyMap)
    .map(({ sessionDates: _sd, ...rest }) => rest)
    .sort((a, b) => b.year - a.year);

  // 10. New Players this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const newPlayersSet = new Set<string>();
  users.forEach((userName) => {
    const userSessions = attendance
      .filter((r) => r[ATT.NAME] === userName)
      .map((r) => parseDate(r[ATT.DATE]))
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());
    if (userSessions.length > 0) {
      const first = userSessions[0];
      if (first.getMonth() === currentMonth && first.getFullYear() === currentYear) {
        newPlayersSet.add(userName);
      }
    }
  });

  // 11. Revenue Trend (this week vs last week)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  let thisWeekRevenue = 0;
  let lastWeekRevenue = 0;
  payments.forEach((r) => {
    const pd = parseDate(r[PAY.DATE]);
    if (!pd) return;
    const amount = parseMoney(r[PAY.AMOUNT]);
    if (pd >= sevenDaysAgo) thisWeekRevenue += amount;
    else if (pd >= fourteenDaysAgo && pd < sevenDaysAgo) lastWeekRevenue += amount;
  });

  let revenueTrend: string;
  if (lastWeekRevenue > 0) {
    const pct = ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue * 100).toFixed(0);
    revenueTrend = Number(pct) >= 0 ? `+${pct}%` : `${pct}%`;
  } else {
    revenueTrend = thisWeekRevenue > 0 ? '+100%' : '--';
  }

  // Chart data
  const chartData = calculateChartData(data, timePeriod, binning);

  return {
    totalPending,
    totalPrepaid,
    operatingCash,
    netLiquidity: operatingCash,
    totalRevenue: totalPlayerPaymentsIn,
    fieldCostsPaid: totalFieldCosts,
    collectedProfit,
    pendingProfit,
    potentialProfit: collectedProfit + pendingProfit,
    totalProfit: collectedProfit,
    activePlayers: activePlayers.size,
    avgAttendance,
    retentionRate,
    paymentVelocity,
    topDebtors,
    yearlyData,
    newPlayers: newPlayersSet.size,
    revenueTrend,
    chartLabels: chartData.labels,
    chartRevenue: chartData.revenue,
    chartAttendance: chartData.attendance,
    chartTimePeriod: timePeriod,
    chartBinning: binning,
  };
}

export function calculateChartData(
  data: AppData,
  timePeriod: TimePeriod | string,
  binning: Binning
): RevenueChartData {
  const { attendance, payments } = data;
  const now = new Date();
  const allDates = [
    ...attendance.map((r) => parseDate(r[ATT.DATE])),
    ...payments.map((r) => parseDate(r[PAY.DATE])),
  ].filter((d): d is Date => d !== null);

  const buckets = generateBuckets(timePeriod, binning, allDates, now);
  const labels: string[] = [];
  const revenue: number[] = [];
  const attendanceData: number[] = [];

  buckets.forEach((bucket) => {
    let bucketRevenue = 0;
    let bucketAttendance = 0;
    payments.forEach((r) => {
      const pd = parseDate(r[PAY.DATE]);
      if (pd && pd >= bucket.start && pd <= bucket.end) {
        bucketRevenue += parseMoney(r[PAY.AMOUNT]);
      }
    });
    attendance.forEach((r) => {
      const ad = parseDate(r[ATT.DATE]);
      if (ad && ad >= bucket.start && ad <= bucket.end) bucketAttendance++;
    });
    labels.push(bucket.label);
    revenue.push(bucketRevenue);
    attendanceData.push(bucketAttendance);
  });

  return { labels, revenue, attendance: attendanceData };
}

export function calculatePaymentVelocityChartData(
  data: AppData,
  timePeriod: TimePeriod | string,
  binning: Binning
): VelocityChartData {
  const { attendance, payments } = data;
  const now = new Date();
  const allDates = [
    ...attendance.map((r) => parseDate(r[ATT.DATE])),
    ...payments.map((r) => parseDate(r[PAY.DATE])),
  ].filter((d): d is Date => d !== null);

  const buckets = generateBuckets(timePeriod, binning, allDates, now);
  const labels: string[] = [];
  const velocities: (number | null)[] = [];

  buckets.forEach((bucket) => {
    let totalDays = 0;
    let count = 0;
    attendance.forEach((att) => {
      const attDate = parseDate(att[ATT.DATE]);
      if (!attDate || attDate < bucket.start || attDate > bucket.end) return;
      const userName = att[ATT.NAME];
      const userPayments = payments.filter((p) => p[PAY.NAME] === userName);
      const nextPayment = userPayments.find((pay) => {
        const pd = parseDate(pay[PAY.DATE]);
        return pd && pd >= attDate;
      });
      if (nextPayment) {
        const pd = parseDate(nextPayment[PAY.DATE])!;
        totalDays += Math.floor((pd.getTime() - attDate.getTime()) / (1000 * 60 * 60 * 24));
        count++;
      }
    });
    labels.push(bucket.label);
    velocities.push(count > 0 ? Math.round(totalDays / count) : null);
  });

  return { labels, velocities };
}

export function calculateRetentionRateChartData(
  data: AppData,
  timePeriod: TimePeriod | string,
  binning: Binning
): RetentionChartData {
  const { attendance } = data;
  const now = new Date();
  const allDates = attendance
    .map((r) => parseDate(r[ATT.DATE]))
    .filter((d): d is Date => d !== null);

  const buckets = generateBuckets(timePeriod, binning, allDates, now);
  const labels: string[] = [];
  const retentionRates: (number | null)[] = [];

  for (let i = 0; i < buckets.length; i++) {
    const bucket = buckets[i];
    const prevBucket = i > 0 ? buckets[i - 1] : null;

    if (!prevBucket) {
      labels.push(bucket.label);
      retentionRates.push(null);
      continue;
    }

    const prevPlayers = new Set<string>();
    attendance.forEach((r) => {
      const d = parseDate(r[ATT.DATE]);
      if (d && d >= prevBucket.start && d <= prevBucket.end) prevPlayers.add(r[ATT.NAME]);
    });

    const currPlayers = new Set<string>();
    attendance.forEach((r) => {
      const d = parseDate(r[ATT.DATE]);
      if (d && d >= bucket.start && d <= bucket.end) currPlayers.add(r[ATT.NAME]);
    });

    if (prevPlayers.size > 0) {
      const retained = [...prevPlayers].filter((p) => currPlayers.has(p)).length;
      labels.push(bucket.label);
      retentionRates.push(Math.round((retained / prevPlayers.size) * 100));
    } else {
      labels.push(bucket.label);
      retentionRates.push(null);
    }
  }

  return { labels, retentionRates };
}
