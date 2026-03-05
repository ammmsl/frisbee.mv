'use client';

import { useEffect, useState } from 'react';
import Modal from '@/app/_components/Modal';
import Button from '@/app/_components/Button';
import { ADMIN_AUTH_KEY } from '../_lib/constants';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD!;

interface Props {
  onAuthenticated: () => void;
}

export default function AdminGate({ onAuthenticated }: Props) {
  const [checked, setChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_AUTH_KEY);
    if (stored === ADMIN_PASSWORD) {
      onAuthenticated();
    } else {
      setModalOpen(true);
    }
    setChecked(true);
  }, [onAuthenticated]);

  function handleSubmit() {
    if (input === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_AUTH_KEY, input);
      setModalOpen(false);
      setError(false);
      setInput('');
      onAuthenticated();
    } else {
      setError(true);
      setInput('');
    }
  }

  if (!checked) return null;

  return (
    <Modal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title="Admin Access"
      closeOnBackdrop={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          Enter the admin password to access the dashboard.
        </p>

        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Password"
          autoFocus
          className="w-full min-h-[44px] rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--accent)] focus-visible:border-[var(--accent)] transition-colors"
        />

        {error && (
          <p className="text-sm text-red-600 font-medium">Incorrect password. Try again.</p>
        )}

        <Button variant="primary" onClick={handleSubmit} className="w-full">
          Unlock
        </Button>
      </div>
    </Modal>
  );
}
