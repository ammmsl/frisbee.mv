'use client';

import { useMemo, useState } from 'react';
import StatTile from '@/app/_components/StatTile';
import AdminRevenueChart from './AdminRevenueChart';
import AdminVelocityChart from './AdminVelocityChart';
import AdminRetentionChart from './AdminRetentionChart';
import AdminDebtorsList from './AdminDebtorsList';
import AdminYearlyTable from './AdminYearlyTable';
import MasterLedger from './MasterLedger';
import { calculateAdminMetrics } from '../_lib/adminMetrics';
import { fmtMoney } from '../_lib/utils';
import { ADMIN_AUTH_KEY } from '../_lib/constants';
import type { AppData, TimePeriod, Binning } from '../_lib/types';

type AdminChart = 'revenue' | 'velocity' | 'retention';
type AdminTab = 'debtors' | 'yearly';

interface Props {
  data: AppData;
  onSelectPlayer: (name: string) => void;
  onSignOut: () => void;
}

export default function AdminDashboard({ data, onSelectPlayer, onSignOut }: Props) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('90');
  const [binning, setBinning] = useState<Binning>('weekly');
  const [activeChart, setActiveChart] = useState<AdminChart>('revenue');
  const [activeTab, setActiveTab] = useState<AdminTab>('debtors');

  const metrics = useMemo(
    () => calculateAdminMetrics(data, timePeriod, binning),
    [data, timePeriod, binning]
  );

  function handleSignOut() {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    onSignOut();
  }

  const chartTabClass = (chart: AdminChart) =>
    `min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] cursor-pointer ${
      activeChart === chart
        ? 'bg-[var(--accent)] text-white'
        : 'border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
    }`;

  const tabClass = (tab: AdminTab) =>
    `min-h-[44px] px-4 py-2 text-sm font-medium border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] cursor-pointer ${
      activeTab === tab
        ? 'border-[var(--accent)] text-[var(--accent)]'
        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h2>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm text-[var(--text-muted)] hover:text-red-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-600 rounded cursor-pointer"
        >
          Sign out
        </button>
      </div>

      {/* Primary metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          value={Math.round(metrics.totalPending)}
          label="Outstanding (MVR)"
          suffix=" MVR"
        />
        <StatTile
          value={Math.round(metrics.totalPrepaid)}
          label="Prepaid (MVR)"
          suffix=" MVR"
        />
        <StatTile
          value={metrics.activePlayers}
          label="Active Players"
        />
        <StatTile
          value={Math.round(metrics.collectedProfit)}
          label="Collected Profit (MVR)"
          suffix=" MVR"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Operating Cash', value: fmtMoney(metrics.operatingCash) },
          { label: 'Avg Attendance', value: String(metrics.avgAttendance) },
          { label: 'Payment Velocity', value: `${metrics.paymentVelocity} days` },
          { label: 'Retention Rate', value: `${metrics.retentionRate}%` },
          { label: 'New Players (month)', value: String(metrics.newPlayers) },
          { label: 'Revenue Trend', value: metrics.revenueTrend },
          { label: 'Pending Profit', value: fmtMoney(metrics.pendingProfit) },
          { label: 'Total Revenue', value: fmtMoney(metrics.totalRevenue) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
          >
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart section */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-4">
        {/* Chart type tabs + time controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={chartTabClass('revenue')} onClick={() => setActiveChart('revenue')}>
              Revenue & Attendance
            </button>
            <button type="button" className={chartTabClass('velocity')} onClick={() => setActiveChart('velocity')}>
              Payment Velocity
            </button>
            <button type="button" className={chartTabClass('retention')} onClick={() => setActiveChart('retention')}>
              Retention Rate
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
            >
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 180 days</option>
              <option value="all">All time</option>
            </select>
            <select
              value={binning}
              onChange={(e) => setBinning(e.target.value as Binning)}
              className="text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {activeChart === 'revenue' && <AdminRevenueChart metrics={metrics} />}
        {activeChart === 'velocity' && <AdminVelocityChart data={data} timePeriod={timePeriod} binning={binning} />}
        {activeChart === 'retention' && <AdminRetentionChart data={data} timePeriod={timePeriod} binning={binning} />}
      </div>

      {/* Debtors / Yearly tabs */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="border-b border-[var(--border)] flex px-4">
          <button type="button" className={tabClass('debtors')} onClick={() => setActiveTab('debtors')}>
            Top 10 Debtors
          </button>
          <button type="button" className={tabClass('yearly')} onClick={() => setActiveTab('yearly')}>
            Yearly Data
          </button>
        </div>
        <div className="p-5">
          {activeTab === 'debtors' && (
            <AdminDebtorsList debtors={metrics.topDebtors} onSelectPlayer={onSelectPlayer} />
          )}
          {activeTab === 'yearly' && (
            <AdminYearlyTable yearlyData={metrics.yearlyData} />
          )}
        </div>
      </div>

      {/* Master Ledger */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
        <MasterLedger data={data} onSelectPlayer={onSelectPlayer} />
      </div>
    </div>
  );
}
