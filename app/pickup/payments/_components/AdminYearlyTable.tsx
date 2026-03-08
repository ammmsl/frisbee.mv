'use client';

import { useState } from 'react';
import { fmtMoney } from '../_lib/utils';
import type { YearlyData } from '../_lib/types';

interface Props {
  yearlyData: YearlyData[];
}

export default function AdminYearlyTable({ yearlyData }: Props) {
  const [yearFilter, setYearFilter] = useState('all');

  const filtered =
    yearFilter === 'all'
      ? yearlyData
      : yearlyData.filter((d) => d.year.toString() === yearFilter);

  const totalRevenue = filtered.reduce((s, d) => s + d.revenue, 0);
  const totalProfit = filtered.reduce((s, d) => s + d.profit, 0);
  const totalFieldCosts = filtered.reduce((s, d) => s + d.fieldCosts, 0);
  const totalNet = totalRevenue - totalFieldCosts;

  const years = yearlyData.map((d) => d.year.toString());

  if (yearlyData.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-8">No yearly data available.</p>
    );
  }

  return (
    <div className="space-y-4">
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

      <div className="w-full overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-[var(--border)]">
        <table className="w-full min-w-max text-sm text-left">
          <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)] sticky top-0 z-10">
            <tr>
              {['Year', 'Revenue', 'Profit', 'Field Costs', 'Net'].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const net = d.revenue - d.fieldCosts;
              return (
                <tr
                  key={d.year}
                  className={`border-t border-[var(--border)] ${i % 2 === 1 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-page)]'}`}
                >
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{d.year}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{fmtMoney(d.revenue)}</td>
                  <td className="px-4 py-3 text-[var(--accent)] font-medium">{fmtMoney(d.profit)}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{fmtMoney(d.fieldCosts)}</td>
                  <td className={`px-4 py-3 font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmtMoney(net)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-[var(--border)] bg-[var(--bg-surface)] font-bold">
            <tr>
              <td className="px-4 py-3 text-[var(--text-primary)]">Total</td>
              <td className="px-4 py-3 text-green-600">{fmtMoney(totalRevenue)}</td>
              <td className="px-4 py-3 text-[var(--accent)]">{fmtMoney(totalProfit)}</td>
              <td className="px-4 py-3 text-red-600">{fmtMoney(totalFieldCosts)}</td>
              <td className={`px-4 py-3 ${totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {fmtMoney(totalNet)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
