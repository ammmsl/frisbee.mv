'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Spinner from '@/app/_components/Spinner';
import Button from '@/app/_components/Button';
import PlayerSearch from './_components/PlayerSearch';
import UserDashboard from './_components/UserDashboard';
import AdminDashboard from './_components/AdminDashboard';
import AdminGate from './_components/AdminGate';
import { fetchAllSheets } from './_lib/sheets';
import type { AppData } from './_lib/types';

type View = 'welcome' | 'user' | 'admin-gate' | 'admin';

export default function PaymentTracker() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<AppData | null>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [view, setView] = useState<View>('welcome');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  async function loadData() {
    setLoadStatus('loading');
    try {
      const appData = await fetchAllSheets();
      setData(appData);
      setUpdatedAt(new Date());
      setLoadStatus('ready');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
      setLoadStatus('error');
    }
  }

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle ?user= URL param once data is ready
  useEffect(() => {
    if (loadStatus !== 'ready' || !data) return;
    const urlUser = searchParams.get('user');
    if (urlUser && data.users.includes(decodeURIComponent(urlUser))) {
      const name = decodeURIComponent(urlUser);
      setCurrentUser(name);
      setView('user');
    }
  }, [loadStatus, data, searchParams]);

  const handleSelectPlayer = useCallback((name: string) => {
    setCurrentUser(name);
    setView('user');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearSearch = useCallback(() => {
    setCurrentUser(null);
    setView('welcome');
  }, []);

  const handleShowAdmin = useCallback(() => {
    setView('admin-gate');
  }, []);

  const handleAdminAuthenticated = useCallback(() => {
    setView('admin');
  }, []);

  const handleAdminSignOut = useCallback(() => {
    setView('welcome');
  }, []);

  const updatedLabel = updatedAt
    ? `Updated ${updatedAt.getHours().toString().padStart(2, '0')}:${updatedAt.getMinutes().toString().padStart(2, '0')}`
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment Tracker</h1>
          {updatedLabel && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{updatedLabel}</p>
          )}
        </div>

        {loadStatus === 'ready' && data && (
          <div className="flex items-center gap-3 flex-wrap">
            <PlayerSearch
              users={data.users}
              currentUser={currentUser}
              onSelect={handleSelectPlayer}
              onClear={handleClearSearch}
            />
            {view !== 'admin' && view !== 'admin-gate' && (
              <button
                type="button"
                onClick={handleShowAdmin}
                className="min-h-[44px] px-4 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] cursor-pointer whitespace-nowrap"
              >
                Admin
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loadStatus === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner size="md" />
          <p className="text-sm text-[var(--text-muted)]">Loading data from Google Sheets…</p>
        </div>
      )}

      {/* Error */}
      {loadStatus === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
          <p className="text-sm font-semibold text-red-700">Could not load payment data</p>
          {errorMsg && (
            <p className="text-xs text-red-600 font-mono break-all">{errorMsg}</p>
          )}
          <Button variant="secondary" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* Main content */}
      {loadStatus === 'ready' && data && (
        <>
          {/* Welcome state */}
          {view === 'welcome' && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center space-y-3">
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                Welcome to the UFA Payment Tracker
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Search for a player above to view their payment status and session history.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {data.users.length} players · {data.attendance.length} attendance records
              </p>
            </div>
          )}

          {/* User dashboard */}
          {view === 'user' && currentUser && (
            <UserDashboard userName={currentUser} data={data} />
          )}

          {/* Admin gate — modal handled inside component */}
          {view === 'admin-gate' && (
            <AdminGate onAuthenticated={handleAdminAuthenticated} />
          )}

          {/* Admin dashboard */}
          {view === 'admin' && (
            <AdminDashboard
              data={data}
              onSelectPlayer={handleSelectPlayer}
              onSignOut={handleAdminSignOut}
            />
          )}
        </>
      )}
    </div>
  );
}
