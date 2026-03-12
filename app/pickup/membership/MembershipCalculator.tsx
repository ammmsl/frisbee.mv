'use client';

import { useState, useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';
import { chart as chartTokens } from '@/lib/tokens';

// --- Constants (unchanged from source) ---
const COST_FIELD = 700;
const FEE_ANNUAL = 250;
const SURCHARGE_MEMBER = 10;
const SURCHARGE_GUEST = 25;
const AVG_PLAYERS = 20;

const BINS = ['12-13','14-15','16-17','18-19','20-21','22-23','24-25','26-27','28-29','30-31','32-33','34-35'];
const FREQUENCIES = [9, 8, 14, 9, 6, 12, 8, 3, 6, 3, 1, 1];

const BASE_COST = COST_FIELD / AVG_PLAYERS; // 35

function getFrequencyLabel(sessions: number): string {
  const perWeek = sessions / 52;
  if (perWeek < 0.5) {
    const perMonth = Math.round(sessions / 12);
    return perMonth === 0 ? '~1x every few months' : `~${perMonth}x/month`;
  }
  if (perWeek < 1) return '~1x every 2 weeks';
  if (perWeek < 1.5) return '~1x/week';
  if (perWeek < 2.5) return '~2x/week';
  if (perWeek < 3.5) return '~3x/week';
  return `~${Math.round(perWeek)}x/week`;
}

export default function MembershipCalculator() {
  const [sessions, setSessions] = useState(20);

  const perPlayerCanvasRef = useRef<HTMLCanvasElement>(null);
  const growthCanvasRef = useRef<HTMLCanvasElement>(null);
  const distCanvasRef = useRef<HTMLCanvasElement>(null);

  const perPlayerChartRef = useRef<ChartType | null>(null);
  const growthChartRef = useRef<ChartType | null>(null);
  const distChartRef = useRef<ChartType | null>(null);

  // Derived values
  const totalGuest = Math.round((BASE_COST + SURCHARGE_GUEST) * sessions);
  const totalMember = Math.round(((BASE_COST + SURCHARGE_MEMBER) * sessions) + FEE_ANNUAL);
  const delta = totalGuest - totalMember;
  const memberWins = delta > 0;
  const sliderPct = ((sessions - 1) / (83 - 1)) * 100;

  // Initialise all three charts on mount
  useEffect(() => {
    import('chart.js/auto').then(({ default: Chart }) => {
      // Per-player cost efficiency chart
      if (perPlayerCanvasRef.current) {
        if (perPlayerChartRef.current) perPlayerChartRef.current.destroy();
        const pRange = Array.from({ length: 27 }, (_, i) => i + 14);
        perPlayerChartRef.current = new Chart(perPlayerCanvasRef.current, {
          type: 'line',
          data: {
            labels: pRange,
            datasets: [
              {
                label: 'Member Cost',
                borderColor: chartTokens.member.line,
                backgroundColor: chartTokens.member.line,
                data: pRange.map((p) => Math.round((COST_FIELD / p) + SURCHARGE_MEMBER)),
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 3,
              },
              {
                label: 'Guest Cost',
                borderColor: chartTokens.guest.line,
                backgroundColor: chartTokens.guest.line,
                data: pRange.map((p) => Math.round((COST_FIELD / p) + SURCHARGE_GUEST)),
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
              y: {
                title: { display: true, text: 'MVR / Session', font: { size: 10 } },
                ticks: { font: { size: 10 } },
              },
              x: {
                title: { display: true, text: 'Players attending', font: { size: 10 } },
                ticks: { font: { size: 10 } },
              },
            },
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } },
            },
          },
        });
      }

      // Annual accumulation chart
      if (growthCanvasRef.current) {
        if (growthChartRef.current) growthChartRef.current.destroy();
        const sRange = Array.from({ length: 43 }, (_, i) => i * 2);
        growthChartRef.current = new Chart(growthCanvasRef.current, {
          type: 'line',
          data: {
            labels: sRange,
            datasets: [
              {
                label: 'Member Total',
                borderColor: chartTokens.member.line,
                data: sRange.map((s) => s * (BASE_COST + SURCHARGE_MEMBER) + FEE_ANNUAL),
                tension: 0.2,
                pointRadius: 0,
                borderWidth: 2,
                fill: false,
              },
              {
                label: 'Guest Total',
                borderColor: chartTokens.guest.line,
                data: sRange.map((s) => s * (BASE_COST + SURCHARGE_GUEST)),
                tension: 0.2,
                pointRadius: 0,
                borderWidth: 2,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
              y: { ticks: { font: { size: 10 } } },
              x: { ticks: { font: { size: 10 }, maxTicksLimit: 8 } },
            },
            plugins: {
              legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } },
            },
          },
        });
      }

      // Attendance distribution chart
      if (distCanvasRef.current) {
        if (distChartRef.current) distChartRef.current.destroy();
        distChartRef.current = new Chart(distCanvasRef.current, {
          type: 'bar',
          data: {
            labels: BINS,
            datasets: [
              {
                label: 'Sessions',
                data: FREQUENCIES,
                backgroundColor: chartTokens.member.fill,
                borderColor: chartTokens.member.line,
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { font: { size: 10 } } },
              x: { ticks: { font: { size: 9 }, maxRotation: 45 } },
            },
          },
        });
      }
    });

    return () => {
      perPlayerChartRef.current?.destroy();
      perPlayerChartRef.current = null;
      growthChartRef.current?.destroy();
      growthChartRef.current = null;
      distChartRef.current?.destroy();
      distChartRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page heading */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1 sm:mb-2">UFA Libeytha?</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Does it make sense to become a UFA member in 2026? Drag the slider to see how the numbers play out.
        </p>
      </div>

      {/* Slider card */}
      <section className="border border-[var(--border)] rounded-xl p-4 sm:p-6 bg-[var(--bg-surface)]">
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 text-center">
          Projected Annual Attendance
        </p>
        <div className="bg-gray-100 rounded-xl border border-gray-300 p-4">
          {/* Slider row with −/+ buttons */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setSessions((s) => Math.max(1, s - 1))}
              className="flex-none w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-gray-200 transition-colors text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]"
              aria-label="Decrease sessions"
            >
              −
            </button>
            <input
              type="range"
              min={1}
              max={83}
              value={sessions}
              step={1}
              onChange={(e) => setSessions(parseInt(e.target.value))}
              style={{
                accentColor: 'var(--accent)',
                background: `linear-gradient(to right, var(--accent) ${sliderPct}%, #d1d5db ${sliderPct}%)`,
              }}
              className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
              aria-label="Number of sessions per year"
            />
            <button
              type="button"
              onClick={() => setSessions((s) => Math.min(83, s + 1))}
              className="flex-none w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-gray-200 transition-colors text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]"
              aria-label="Increase sessions"
            >
              +
            </button>
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <span className="hidden sm:block text-xs font-black text-[var(--text-muted)] uppercase tracking-wide">1 Session</span>
            <div className="text-center col-span-3 sm:col-span-1">
              <span
                className="text-4xl sm:text-5xl font-black block leading-none"
                style={{ color: 'var(--accent)' }}
              >
                {sessions}
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase block mt-1">
                {getFrequencyLabel(sessions)}
              </span>
              <span className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wide">
                Total Sessions
              </span>
            </div>
            <span className="hidden sm:block text-xs font-black text-[var(--text-muted)] uppercase tracking-wide text-right">83 Max</span>
          </div>
        </div>
      </section>

      {/* Status indicator */}
      <div
        className={`rounded-2xl p-1 transition-all duration-500 shadow-lg ${
          memberWins ? 'bg-green-500 shadow-green-200' : 'shadow-sky-200'
        }`}
        style={!memberWins ? { backgroundColor: 'var(--accent)' } : {}}
      >
        <div className="bg-[var(--bg-surface)] rounded-xl p-4 sm:p-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr_3fr] items-center">
            <div>
              <h2
                className="text-xl sm:text-2xl font-black mb-1 sm:mb-2"
                style={{ color: memberWins ? '#059669' : 'var(--accent)' }}
              >
                {memberWins ? 'Membership Wins!' : 'Guest is Better'}
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {memberWins
                  ? `You save MVR ${delta.toLocaleString()} per year vs guest rates. At ${sessions} sessions, membership pays off.`
                  : `You're MVR ${Math.abs(delta).toLocaleString()} from break-even. Membership is cheaper after 17+ sessions.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 sm:p-4 bg-[var(--bg-page)] border border-[var(--border)]">
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-wide mb-1 sm:mb-2">
                  Guest Total
                </p>
                <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  MVR {totalGuest.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 sm:mt-2 font-semibold italic">
                  MVR 25 surcharge/session
                </p>
              </div>
              <div
                className="rounded-xl p-3 sm:p-4 border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent) 10%, white)',
                  borderColor: 'color-mix(in srgb, var(--accent) 30%, white)',
                }}
              >
                <p className="text-xs font-black uppercase tracking-wide mb-1 sm:mb-2" style={{ color: 'var(--accent-dark)' }}>
                  Member Total
                </p>
                <p className="text-xl sm:text-2xl font-black" style={{ color: 'var(--accent-dark)' }}>
                  MVR {totalMember.toLocaleString()}
                </p>
                <p className="text-xs mt-1 sm:mt-2 font-bold uppercase" style={{ color: 'var(--accent)' }}>
                  +MVR 250 annual fee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per session cost chart */}
      <section className="min-w-0 border border-[var(--border)] rounded-xl p-4 sm:p-6 bg-[var(--bg-surface)]">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-xl font-bold text-[var(--text-primary)]">Per Session Cost Efficiency</h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] italic">
            Comparison based on the number of players attending.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-2 sm:p-3">
            <span className="block text-xs font-black text-red-400 uppercase tracking-wide mb-1">Highest (14 pax)</span>
            <div className="flex items-baseline gap-2">
              <div>
                <span className="text-sm sm:text-base font-black text-red-600">MVR 60</span>
                <span className="text-xs font-bold text-red-400">/Mem</span>
              </div>
              <div className="w-px h-3 bg-red-200" />
              <div>
                <span className="text-sm sm:text-base font-black text-red-600">MVR 75</span>
                <span className="text-xs font-bold text-red-400">/Guest</span>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 sm:p-3">
            <span className="block text-xs font-black text-emerald-400 uppercase tracking-wide mb-1">Average (20 pax)</span>
            <div className="flex items-baseline gap-2">
              <div>
                <span className="text-sm sm:text-base font-black text-emerald-600">MVR 45</span>
                <span className="text-xs font-bold text-emerald-400">/Mem</span>
              </div>
              <div className="w-px h-3 bg-emerald-200" />
              <div>
                <span className="text-sm sm:text-base font-black text-emerald-600">MVR 60</span>
                <span className="text-xs font-bold text-emerald-400">/Guest</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-48 sm:h-64 min-w-0 overflow-hidden">
          <canvas ref={perPlayerCanvasRef} />
        </div>
      </section>

      {/* Annual accumulation + distribution charts */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
        <section className="min-w-0 border border-[var(--border)] rounded-xl p-4 sm:p-6 bg-[var(--bg-surface)]">
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3 sm:mb-4">Annual Accumulation</h3>
          <div className="relative h-44 sm:h-56 min-w-0 overflow-hidden">
            <canvas ref={growthCanvasRef} />
          </div>
        </section>

        <section className="min-w-0 border border-[var(--border)] rounded-xl p-4 sm:p-6 bg-[var(--bg-surface)]">
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-0.5 sm:mb-1">Attendance Distribution</h3>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-bold mb-3 sm:mb-4">
            2-Player Bins · Historical Data
          </p>
          <div className="relative h-44 sm:h-56 min-w-0 overflow-hidden">
            <canvas ref={distCanvasRef} />
          </div>
        </section>
      </div>
    </div>
  );
}
