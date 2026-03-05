'use client';

import { useState } from 'react';
import PaymentSummaryTab from './PaymentSummaryTab';
import ActivityOverviewTab from './ActivityOverviewTab';
import AttendanceTable from './AttendanceTable';
import PaymentQRModal from './PaymentQRModal';
import { calculateFinancialLedger } from '../_lib/ledger';
import { ATT } from '../_lib/constants';
import type { AppData } from '../_lib/types';

type Tab = 'payment' | 'activity';

interface Props {
  userName: string;
  data: AppData;
}

export default function UserDashboard({ userName, data }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('payment');
  const [selectedYear, setSelectedYear] = useState<string>(data.years[0] || '');
  const [qrOpen, setQrOpen] = useState(false);

  const ledger = calculateFinancialLedger(userName, data);
  const attRows = data.attendance.filter((r) => r[ATT.NAME] === userName);
  const summaryRow = data.summary.find((r) => r[1] === userName);

  const months = [...new Set(attRows.map((r) => r[ATT.MONTH]))].filter(Boolean);
  const locations = [...new Set(attRows.map((r) => r[ATT.LOCATION]))].filter(Boolean);

  const tabBtnClass = (tab: Tab) =>
    `min-h-[44px] px-5 py-2 text-sm font-medium border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] cursor-pointer ${
      activeTab === tab
        ? 'border-[var(--accent)] text-[var(--accent)]'
        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <div className="space-y-6">
      {/* Player name heading */}
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">{userName}</h2>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] flex">
        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={tabBtnClass('payment')}
        >
          Payment Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={tabBtnClass('activity')}
        >
          Activity Overview
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'payment' && (
        <PaymentSummaryTab
          summaryRow={summaryRow}
          ledger={ledger}
          attRows={attRows}
          onShowQR={() => setQrOpen(true)}
        />
      )}
      {activeTab === 'activity' && (
        <ActivityOverviewTab
          attRows={attRows}
          years={data.years}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      )}

      {/* Attendance history */}
      <div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Attendance History
        </h3>
        <AttendanceTable
          attRows={attRows}
          months={months}
          years={data.years}
          locations={locations}
        />
      </div>

      <PaymentQRModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}
