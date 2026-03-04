'use client';

import { useEffect, useState } from 'react';
import SearchInput from '@/app/_components/SearchInput';
import Badge from '@/app/_components/Badge';
import Skeleton from '@/app/_components/Skeleton';
import Button from '@/app/_components/Button';

// Public credentials — already exposed in the existing GitHub Pages deployment
const API_KEY  = 'AIzaSyB4FKQrbrtGpBztkZVriYkEGsXlnLXHAN0';
const SHEET_ID = '1kI6E4J0pL4lUa2NH-FYEd2rWUE7Uzsz-CnGOg68ERtc';
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Summary Sheet column indices (0-based)
const COL = {
  NAME:    1,
  PENDING: 2,
  PREPAY:  3,
  TOTAL:   4,
} as const;

interface Player {
  name:    string;
  pending: number;
  prepay:  number;
}

function parseMoney(val: string | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function formatMVR(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function PlayerSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-[var(--border)] last:border-b-0 gap-4">
      <div className="flex flex-col gap-1.5 flex-1">
        <Skeleton className="h-4 w-32 rounded" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  );
}

export default function PaymentTracker() {
  const [players,   setPlayers]   = useState<Player[]>([]);
  const [status,    setStatus]    = useState<'loading' | 'error' | 'ready'>('loading');
  const [search,    setSearch]    = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  async function fetchData() {
    setStatus('loading');
    try {
      const url = `${BASE_URL}/${SHEET_ID}/values/Summary%20Sheet?key=${API_KEY}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      const rows: string[][] = json.values ?? [];

      const parsed: Player[] = rows
        .slice(1)
        .filter((row) => row[COL.NAME])
        .map((row) => ({
          name:    row[COL.NAME],
          pending: parseMoney(row[COL.PENDING]),
          prepay:  parseMoney(row[COL.PREPAY]),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setPlayers(parsed);
      setUpdatedAt(new Date());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => { fetchData(); }, []);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const updatedLabel = updatedAt
    ? `Updated ${updatedAt.getHours().toString().padStart(2, '0')}:${updatedAt.getMinutes().toString().padStart(2, '0')}`
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        Payment Tracker
      </h1>

      {/* Search + updated timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name…"
          />
        </div>
        {updatedLabel && (
          <p className="text-xs text-[var(--text-muted)] shrink-0">{updatedLabel}</p>
        )}
      </div>

      {/* Loading */}
      {status === 'loading' && (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <PlayerSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="text-center py-12 px-4">
          <p className="text-[var(--text-muted)] mb-4">
            Could not load payment data. Please try again.
          </p>
          <Button variant="secondary" onClick={fetchData}>
            Retry
          </Button>
        </div>
      )}

      {/* Ready */}
      {status === 'ready' && (
        <>
          {filtered.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-8 text-center">
              No players match &ldquo;{search}&rdquo;.
            </p>
          ) : (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
              {filtered.map((player) => {
                const badge =
                  player.pending > 0
                    ? { label: 'Unpaid',  variant: 'unpaid' as const }
                    : player.prepay > 0
                    ? { label: 'Prepaid', variant: 'paid'   as const }
                    : { label: 'Paid',    variant: 'paid'   as const };

                return (
                  <div
                    key={player.name}
                    className="flex items-center justify-between min-h-[44px] py-3 px-4 border-b border-[var(--border)] last:border-b-0 gap-4"
                  >
                    <div>
                      <p className="font-medium text-[var(--text-primary)] text-sm">
                        {player.name}
                      </p>
                      {player.pending > 0 && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          MVR {formatMVR(player.pending)} pending
                        </p>
                      )}
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}

          {/* How to pay */}
          <div className="mt-8 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)] mb-2 text-sm">
              How to pay
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Transfer to BML account{' '}
              <span className="font-mono text-[var(--text-primary)]">7730000682000</span>{' '}
              (UFA). Use your name as the reference. For queries, message us on{' '}
              <a
                href="https://wa.me/9609666800"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline font-medium focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] rounded"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </>
      )}
    </div>
  );
}
